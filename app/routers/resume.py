import os
import shutil
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.config import settings
import app.models as models
import app.schemas as schemas
from app.services.extractor import extract_text
from app.services.parser import parse_resume_text
from app.services.scoring import evaluate_resume_ats, generate_interview_prep_with_gemini, generate_interview_prep_local
from app.services.security import get_current_verified_user
from app.services.enhancement import generate_resume_enhancements
from app.services.pdf_generator import (
    generate_resume_pdf_report,
    generate_resume_template_pdf,
    generate_interview_prep_pdf,
    validate_ats_report_sections
)

router = APIRouter(prefix="/resumes", tags=["Resumes"])
logger = logging.getLogger("app.routers.resume")

ALLOWED_EXTENSIONS = {".pdf", ".docx"}

@router.post("/upload", response_model=schemas.ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(..., description="PDF or DOCX resume file"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Upload a resume, extract text, parse it with Gemini AI, and save it in the database.
    """
    # 1. Validate file extension
    filename = file.filename
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File has no filename."
        )
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Only PDF and DOCX files are allowed."
        )

    # 2. Save the uploaded file to disk
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Sanitize file name to prevent directory traversal
    safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-").strip()
    # Add unique suffix if file already exists to prevent overwrite
    base, extension = os.path.splitext(safe_filename)
    counter = 1
    while os.path.exists(os.path.join(settings.UPLOAD_DIR, safe_filename)):
        safe_filename = f"{base}_{counter}{extension}"
        counter += 1

    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file on server."
        )

    # 3. Extract text from file
    try:
        raw_text = extract_text(file_path)
    except Exception as e:
        # Clean up saved file on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract text from resume: {str(e)}"
        )

    # 4. Parse text using Gemini API
    try:
        parsed_data = parse_resume_text(raw_text)
    except ValueError as ve:
        # Configuration error or invalid input text
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        # Standard parsing API errors
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Parsing error: {str(e)}"
        )

    # 5. Create database record
    try:
        db_resume = models.Resume(
            user_id=current_user.id,
            filename=filename,
            file_path=file_path,
            raw_text=raw_text,
            name=parsed_data.name,
            email=parsed_data.email,
            phone=parsed_data.phone,
            summary=parsed_data.summary,
            skills=parsed_data.skills,
            education=[edu.model_dump() for edu in parsed_data.education],
            experience=[exp.model_dump() for exp in parsed_data.experience],
            projects=[proj.model_dump() for proj in parsed_data.projects],
            certifications=[cert.model_dump() for cert in parsed_data.certifications],
            languages=[lang.model_dump() for lang in parsed_data.languages],
            leadership=parsed_data.leadership,
            interests=parsed_data.interests,
            referees=parsed_data.referees,
            profession=parsed_data.profession,
            industry=parsed_data.industry,
            seniority=parsed_data.seniority,
            experience_level=parsed_data.experience_level,
            career_objective=parsed_data.career_objective,
            profession_confidence=parsed_data.profession_confidence,
            validation_passed=parsed_data.validation_passed,
            validation_reason=parsed_data.validation_reason
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)
        return db_resume
    except Exception as e:
        logger.error(f"Failed to store resume record: {str(e)}")
        db.rollback()
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database insertion failed: {str(e)}"
        )

@router.get("/templates", response_model=List[schemas.TemplateResponse])
def get_available_templates(
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Get the list of all available resume templates with metadata.
    """
    return [
        {
            "name": "ATS Professional",
            "description": "Standard single-column format optimized for ATS parsing and readability.",
            "category": "Professional",
            "supported_formats": ["pdf", "docx"]
        },
        {
            "name": "Modern Professional",
            "description": "Clean, contemporary design with subtle layout elements and professional formatting.",
            "category": "Professional",
            "supported_formats": ["pdf", "docx"]
        },
        {
            "name": "Software Engineer",
            "description": "Tailored for software engineering and technical roles, highlighting skills, languages, and technical projects.",
            "category": "Technical",
            "supported_formats": ["pdf", "docx"]
        },
        {
            "name": "Data Analyst",
            "description": "Optimized layout for analytical roles, placing focus on skills toolkit and certification credentials.",
            "category": "Technical",
            "supported_formats": ["pdf", "docx"]
        },
        {
            "name": "Executive",
            "description": "Premium layout with generous margins and dignified structure for senior candidates and executives.",
            "category": "Executive",
            "supported_formats": ["pdf", "docx"]
        },
        {
            "name": "Creative",
            "description": "Vibrant two-column style showcasing personality, creative projects, and highlighted credentials.",
            "category": "Creative",
            "supported_formats": ["pdf", "docx"]
        },
        {
            "name": "Minimal Elegant",
            "description": "Ultra-clean and modern, utilizing spacious typography and elegant spacing.",
            "category": "Minimal",
            "supported_formats": ["pdf", "docx"]
        },
        {
            "name": "Student/Fresher",
            "description": "Academic-focused layout prioritizing education history, internships, and dynamic extracurricular credentials.",
            "category": "Academic",
            "supported_formats": ["pdf", "docx"]
        }
    ]

@router.get("", response_model=List[schemas.ResumeListResponse])
def get_resume_history(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Max number of records to return"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Get a list of previously uploaded resumes (history) with brief details.
    """
    query = db.query(models.Resume).filter(models.Resume.user_id == current_user.id)
    resumes = query.order_by(models.Resume.created_at.desc()).offset(skip).limit(limit).all()
    return resumes

@router.get("/{resume_id}", response_model=schemas.ResumeResponse)
def get_resume_details(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Get full details of a specific resume by its database ID.
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resume."
        )
    return resume

@router.post("/{resume_id}/analyze", response_model=schemas.ATSAnalysisSchema)
def analyze_resume_ats(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Evaluate resume structure and visual layout to calculate an ATS score out of 100
    with concrete strengths, weaknesses, and missing sections.
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resume."
        )
        
    try:
        # Calculate ATS score and evaluation metrics
        ats_analysis = evaluate_resume_ats(resume)
        
        # Cache / Save results in the database
        resume.ats_score = ats_analysis.ats_score
        resume.ats_analysis = ats_analysis.model_dump()
        
        db.commit()
        db.refresh(resume)
        
        return ats_analysis
    except Exception as e:
        logger.error(f"Failed to calculate or save ATS score: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ATS Analysis failed: {str(e)}"
        )

@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Delete a resume, all related reports, and its uploaded file.
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this resume."
        )

    # 1. Delete associated file from uploads folder
    if resume.file_path and os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
            logger.info(f"Deleted file: {resume.file_path}")
        except Exception as e:
            logger.error(f"Failed to delete file {resume.file_path}: {str(e)}")

    try:
        # 2. Programmatically clean up related tables (JobMatches, RecruiterSimulations)
        db.query(models.JobMatch).filter(models.JobMatch.resume_id == resume_id).delete()
        db.query(models.RecruiterSimulation).filter(models.RecruiterSimulation.resume_id == resume_id).delete()
        
        # 3. Delete the parent Resume record
        db.delete(resume)
        db.commit()
        return {"message": "Resume and associated reports deleted successfully."}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete resume record {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete resume record: {str(e)}"
        )

@router.delete("", status_code=status.HTTP_200_OK)
def delete_all_resumes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Delete all resumes, related reports, and all uploaded files from the disk.
    """
    try:
        resumes = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).all()
        
        # 1. Delete all uploaded files
        for resume in resumes:
            if resume.file_path and os.path.exists(resume.file_path):
                try:
                    os.remove(resume.file_path)
                    logger.info(f"Deleted file: {resume.file_path}")
                except Exception as e:
                    logger.error(f"Failed to delete file {resume.file_path}: {str(e)}")
        
        # 2. Clear database tables
        resume_ids = [r.id for r in resumes]
        if resume_ids:
            db.query(models.JobMatch).filter(models.JobMatch.resume_id.in_(resume_ids)).delete(synchronize_session=False)
            db.query(models.RecruiterSimulation).filter(models.RecruiterSimulation.resume_id.in_(resume_ids)).delete(synchronize_session=False)
            db.query(models.Resume).filter(models.Resume.id.in_(resume_ids)).delete(synchronize_session=False)
        
        db.commit()
        return {"message": "All resume analyses and associated reports deleted successfully."}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to clear resume history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}"
        )


@router.get("/{resume_id}/enhancements")
def get_resume_enhancement_suggestions(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Get side-by-side resume improvement suggestions.
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resume."
        )
        
    try:
        return generate_resume_enhancements(resume)
    except Exception as e:
        logger.error(f"Failed to generate enhancements: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate enhancements: {str(e)}"
        )


@router.get("/{resume_id}/export-pdf")
def export_resume_report_pdf(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Generate and download a professional PDF evaluation report for a candidate.
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resume."
        )
        
    try:
        # Generate enhancements and score scorecard
        if resume.ats_score is None or resume.ats_analysis is None or "readiness_level" not in resume.ats_analysis:
            # Audit scorecard first if not computed or legacy
            ats_analysis = evaluate_resume_ats(resume)
            resume.ats_score = ats_analysis.ats_score
            resume.ats_analysis = ats_analysis.model_dump()
            db.commit()
            db.refresh(resume)
            
        # Validate the report contents
        validate_ats_report_sections(resume)
            
        enhancements = generate_resume_enhancements(resume)
        file_stream = generate_resume_pdf_report(resume, enhancements)
        filename = f"ResumeIQ_Report_{resume.name or 'Candidate'}.pdf"
        
        return StreamingResponse(
            file_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except ValueError as val_err:
        logger.error(f"Validation failed for PDF report: {str(val_err)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Report validation failed: {str(val_err)}"
        )
    except Exception as e:
        logger.error(f"Failed to export PDF report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export PDF report: {str(e)}"
        )


@router.put("/{resume_id}", response_model=schemas.ResumeResponse)
def update_resume_details(
    resume_id: int,
    resume_data: schemas.ResumeParsedSchema,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Update parsed resume information in the database.
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this resume."
        )

    try:
        resume.name = resume_data.name
        resume.email = resume_data.email
        resume.phone = resume_data.phone
        resume.summary = resume_data.summary
        resume.skills = resume_data.skills
        
        # Serialize list fields using model_dump()
        resume.education = [edu.model_dump() for edu in resume_data.education]
        resume.experience = [exp.model_dump() for exp in resume_data.experience]
        resume.projects = [proj.model_dump() for proj in resume_data.projects]
        resume.certifications = [cert.model_dump() for cert in resume_data.certifications]
        resume.languages = [lang.model_dump() for lang in resume_data.languages]
        resume.leadership = resume_data.leadership
        resume.interests = resume_data.interests
        resume.referees = resume_data.referees
        
        # Update Phase 2 fields if changed/provided
        resume.profession = resume_data.profession
        resume.industry = resume_data.industry
        resume.seniority = resume_data.seniority
        resume.experience_level = resume_data.experience_level
        resume.career_objective = resume_data.career_objective
        resume.profession_confidence = resume_data.profession_confidence
        resume.validation_passed = resume_data.validation_passed
        resume.validation_reason = resume_data.validation_reason
        
        # Recalculate ATS scorecard on edit to ensure visual metrics update dynamically
        ats_analysis = evaluate_resume_ats(resume)
        resume.ats_score = ats_analysis.ats_score
        resume.ats_analysis = ats_analysis.model_dump()

        db.commit()
        db.refresh(resume)
        return resume
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update resume: {str(e)}"
        )


@router.post("/{resume_id}/export-template")
def export_resume_template(
    resume_id: int,
    request: schemas.ResumeExportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Generate and download a styled resume PDF/DOCX using a selected template.
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resume."
        )
        
    try:
        # Use provided custom data if available, otherwise fallback to database values
        if request.resume_data:
            data_dict = request.resume_data.model_dump()
        else:
            data_dict = {
                "name": resume.name,
                "email": resume.email,
                "phone": resume.phone,
                "summary": resume.summary,
                "skills": resume.skills,
                "education": resume.education,
                "experience": resume.experience,
                "projects": resume.projects,
                "certifications": resume.certifications,
                "languages": resume.languages,
                "leadership": resume.leadership,
                "interests": resume.interests,
                "referees": resume.referees
            }
            
        fmt = request.format.lower()
        if fmt == "pdf":
            file_stream = generate_resume_template_pdf(data_dict, request.template_name)
            media_type = "application/pdf"
            ext = "pdf"
        elif fmt == "docx":
            from app.services.docx_generator import generate_resume_template_docx
            file_stream = generate_resume_template_docx(data_dict, request.template_name)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ext = "docx"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported export format. Must be 'pdf' or 'docx'."
            )
            
        # Clean candidate name for filename
        safe_name = "".join(c for c in (resume.name or "Candidate") if c.isalnum() or c in " -_").strip()
        filename = f"{safe_name}_Resume_{request.template_name.replace(' ', '_')}.{ext}"
        
        return StreamingResponse(
            file_stream,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to export resume template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export resume: {str(e)}"
        )

@router.post("/{resume_id}/interview-prep", response_model=schemas.ATSAnalysisSchema)
def generate_interview_prep(
    resume_id: int,
    request: Optional[schemas.JDMatchRequest] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Generates customized interview preparation Q&As based on resume and optional target Job Description.
    Saves the output within the resume's ats_analysis.interview_prep object.
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resume."
        )

    # Make sure we have an existing ats_analysis. If not, generate base report first.
    if not resume.ats_analysis:
        ats_analysis = evaluate_resume_ats(resume)
        resume.ats_score = ats_analysis.ats_score
        resume.ats_analysis = ats_analysis.model_dump()
        db.commit()
        db.refresh(resume)

    jd_text = request.jd_text if request else None

    # Try Gemini, fallback to local rule-based engine
    prep_data = None
    if settings.GEMINI_API_KEY:
        try:
            logger.info("Generating interview prep with Gemini AI...")
            prep_data = generate_interview_prep_with_gemini(resume, jd_text)
        except Exception as e:
            logger.warning(f"Failed to generate interview prep with Gemini: {str(e)}. Falling back to local.")
            
    if not prep_data:
        logger.info("Generating interview prep with local rules...")
        prep_data = generate_interview_prep_local(resume, jd_text)

    # Save within resume's ats_analysis object
    ats_dict = dict(resume.ats_analysis)
    ats_dict["interview_prep"] = prep_data.model_dump()
    
    # Validate the dictionary back into an ATSAnalysisSchema to make sure it matches
    updated_analysis = schemas.ATSAnalysisSchema(**ats_dict)
    
    resume.ats_analysis = updated_analysis.model_dump()
    db.commit()
    db.refresh(resume)

    return updated_analysis

@router.get("/{resume_id}/export-interview")
def export_interview_prep(
    resume_id: int,
    export_type: str = "guide",  # "questions" or "guide"
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Generate and stream back a PDF document for Interview Preparation.
    export_type can be 'questions' (clean practice sheet) or 'guide' (comprehensive study guide).
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resume."
        )

    if not resume.ats_analysis or "interview_prep" not in resume.ats_analysis or not resume.ats_analysis["interview_prep"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview preparation guide has not been generated for this resume. Please generate it first."
        )

    try:
        prep_data = resume.ats_analysis["interview_prep"]
        resume_data = {
            "name": resume.name,
            "skills": resume.skills,
            "experience": resume.experience,
            "projects": resume.projects,
            "certifications": resume.certifications
        }
        
        file_stream = generate_interview_prep_pdf(resume_data, prep_data, export_type)
        
        doc_label = "Practice_Questions" if export_type == "questions" else "Study_Guide"
        filename = f"ResumeIQ_{doc_label}_{resume.name or 'Candidate'}.pdf"
        
        return StreamingResponse(
            file_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        logger.error(f"Failed to export interview prep PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export interview prep PDF: {str(e)}"
        )




