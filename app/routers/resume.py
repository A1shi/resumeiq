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

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".jpg", ".jpeg"}

@router.post("/upload", response_model=schemas.ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(..., description="PDF, DOCX, or Image resume file"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Upload a resume, extract text, parse it with Gemini AI, and save it in the database.
    """
    # 1. Validate file extension and size
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
            detail="Unsupported file type. Only PDF, DOCX, and JPG/JPEG image files are allowed."
        )

    # Validate file size (5MB limit)
    try:
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        MAX_FILE_SIZE = 5 * 1024 * 1024
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds the maximum limit of 5MB."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to check file size: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate file size."
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
        resume.achievements = resume_data.achievements or []
        resume.section_order = resume_data.section_order or []
        resume.customization = resume_data.customization or {}
        
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
    Generates customized interview preparation questions based on resume, optional Job Description and target Job Role.
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
    job_role = request.job_role if request else None

    # Try Gemini, fallback to local rule-based engine
    prep_data = None
    if settings.GEMINI_API_KEY:
        try:
            logger.info("Generating interview prep with Gemini AI...")
            prep_data = generate_interview_prep_with_gemini(resume, jd_text, job_role)
        except Exception as e:
            logger.warning(f"Failed to generate interview prep with Gemini: {str(e)}. Falling back to local.")
            
    if not prep_data:
        logger.info("Generating interview prep with local rules...")
        prep_data = generate_interview_prep_local(resume, jd_text, job_role)

    # Save within resume's ats_analysis object
    ats_dict = dict(resume.ats_analysis)
    ats_dict["interview_prep"] = prep_data.model_dump()
    
    # Validate the dictionary back into an ATSAnalysisSchema to make sure it matches
    updated_analysis = schemas.ATSAnalysisSchema(**ats_dict)
    
    resume.ats_analysis = updated_analysis.model_dump()
    db.commit()
    db.refresh(resume)

    return updated_analysis

@router.post("/{resume_id}/interview-prep/toggle-status", response_model=schemas.ATSAnalysisSchema)
def toggle_interview_question_status(
    resume_id: int,
    request: schemas.ToggleStatusRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Toggles the state of a specific interview question (completed, favorite, needs_practice).
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
            detail="Interview preparation questions have not been generated for this resume."
        )

    from copy import deepcopy
    from sqlalchemy.orm.attributes import flag_modified

    ats_dict = deepcopy(resume.ats_analysis)
    prep_dict = ats_dict["interview_prep"]
    
    category = request.category
    question_idx = request.question_idx
    status_type = request.status_type

    if category not in prep_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category '{category}'."
        )

    questions_list = prep_dict[category]
    if question_idx < 0 or question_idx >= len(questions_list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question index {question_idx} for category '{category}'."
        )

    question = questions_list[question_idx]
    if status_type not in ["completed", "favorite", "needs_practice"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status type '{status_type}'."
        )

    # Toggle the status
    question[status_type] = not question.get(status_type, False)

    # Save and commit
    updated_analysis = schemas.ATSAnalysisSchema(**ats_dict)
    resume.ats_analysis = updated_analysis.model_dump()
    flag_modified(resume, "ats_analysis")
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


# --- Phase 6 Professional Resume Builder & Versioning Endpoints ---

@router.post("/create", response_model=schemas.ResumeResponse, status_code=status.HTTP_201_CREATED)
def create_resume_from_scratch(
    resume_data: schemas.ResumeParsedSchema,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Create a new resume from scratch without uploading one.
    """
    try:
        db_resume = models.Resume(
            user_id=current_user.id,
            filename="Resume_Built_From_Scratch.pdf",
            file_path="",
            raw_text="",
            name=resume_data.name,
            email=resume_data.email,
            phone=resume_data.phone,
            summary=resume_data.summary,
            skills=resume_data.skills,
            education=[edu.model_dump() for edu in resume_data.education],
            experience=[exp.model_dump() for exp in resume_data.experience],
            projects=[proj.model_dump() for proj in resume_data.projects],
            certifications=[cert.model_dump() for cert in resume_data.certifications],
            languages=[lang.model_dump() for lang in resume_data.languages],
            leadership=resume_data.leadership or [],
            interests=resume_data.interests or [],
            referees=resume_data.referees or [],
            achievements=resume_data.achievements or [],
            section_order=resume_data.section_order or [],
            customization=resume_data.customization or {},
            profession=resume_data.profession or "General Professional",
            industry=resume_data.industry or "General",
            seniority=resume_data.seniority,
            experience_level=resume_data.experience_level,
            career_objective=resume_data.career_objective,
            profession_confidence=100.0,
            validation_passed=True,
            validation_reason="Created manually from scratch"
        )
        
        # Calculate initial ATS Score details for empty/baseline state
        ats_analysis = evaluate_resume_ats(db_resume)
        db_resume.ats_score = ats_analysis.ats_score
        db_resume.ats_analysis = ats_analysis.model_dump()
        
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)
        return db_resume
    except Exception as e:
        logger.error(f"Failed to create resume from scratch: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create resume from scratch: {str(e)}"
        )


@router.post("/{resume_id}/version", response_model=schemas.ResumeResponse)
def save_resume_version(
    resume_id: int,
    version_name: str = Query(..., description="The name of this version"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Save the current resume state as a new historical version.
    """
    parent = db.query(models.Resume).filter(
        models.Resume.id == resume_id, 
        models.Resume.user_id == current_user.id
    ).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent resume not found.")
        
    try:
        version = models.Resume(
            user_id=current_user.id,
            parent_id=parent.id,
            version_name=version_name,
            filename=f"{parent.filename} ({version_name})",
            file_path=parent.file_path,
            raw_text=parent.raw_text,
            name=parent.name,
            email=parent.email,
            phone=parent.phone,
            summary=parent.summary,
            skills=parent.skills,
            education=parent.education,
            experience=parent.experience,
            projects=parent.projects,
            certifications=parent.certifications,
            languages=parent.languages,
            leadership=parent.leadership,
            interests=parent.interests,
            referees=parent.referees,
            achievements=parent.achievements,
            section_order=parent.section_order,
            customization=parent.customization,
            profession=parent.profession,
            industry=parent.industry,
            seniority=parent.seniority,
            experience_level=parent.experience_level,
            career_objective=parent.career_objective,
            profession_confidence=parent.profession_confidence,
            validation_passed=parent.validation_passed,
            validation_reason=parent.validation_reason,
            ats_score=parent.ats_score,
            ats_analysis=parent.ats_analysis
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        return version
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save resume version: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save version: {str(e)}")


@router.get("/{resume_id}/versions", response_model=List[schemas.ResumeResponse])
def get_resume_versions(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Get all historical versions associated with a parent resume.
    """
    versions = db.query(models.Resume).filter(
        models.Resume.parent_id == resume_id,
        models.Resume.user_id == current_user.id
    ).order_by(models.Resume.created_at.desc()).all()
    return versions


@router.post("/{resume_id}/restore/{version_id}", response_model=schemas.ResumeResponse)
def restore_resume_version(
    resume_id: int,
    version_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Restore the parent resume's content from a previously saved version.
    """
    parent = db.query(models.Resume).filter(
        models.Resume.id == resume_id, 
        models.Resume.user_id == current_user.id
    ).first()
    version = db.query(models.Resume).filter(
        models.Resume.id == version_id, 
        models.Resume.user_id == current_user.id,
        models.Resume.parent_id == resume_id
    ).first()
    if not parent or not version:
        raise HTTPException(status_code=404, detail="Parent resume or version not found.")
        
    try:
        parent.name = version.name
        parent.email = version.email
        parent.phone = version.phone
        parent.summary = version.summary
        parent.skills = version.skills
        parent.education = version.education
        parent.experience = version.experience
        parent.projects = version.projects
        parent.certifications = version.certifications
        parent.languages = version.languages
        parent.leadership = version.leadership
        parent.interests = version.interests
        parent.referees = version.referees
        parent.achievements = version.achievements
        parent.section_order = version.section_order
        parent.customization = version.customization
        parent.profession = version.profession
        parent.industry = version.industry
        parent.seniority = version.seniority
        parent.experience_level = version.experience_level
        parent.career_objective = version.career_objective
        parent.ats_score = version.ats_score
        parent.ats_analysis = version.ats_analysis
        
        db.commit()
        db.refresh(parent)
        return parent
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to restore version: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to restore version: {str(e)}")


@router.post("/{resume_id}/duplicate", response_model=schemas.ResumeResponse)
def duplicate_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Duplicate a resume to create a new standalone resume document.
    """
    source = db.query(models.Resume).filter(
        models.Resume.id == resume_id, 
        models.Resume.user_id == current_user.id
    ).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source resume not found.")
        
    try:
        duplicated = models.Resume(
            user_id=current_user.id,
            parent_id=None,
            version_name=None,
            filename=f"Copy_of_{source.filename}",
            file_path=source.file_path,
            raw_text=source.raw_text,
            name=source.name,
            email=source.email,
            phone=source.phone,
            summary=source.summary,
            skills=source.skills,
            education=source.education,
            experience=source.experience,
            projects=source.projects,
            certifications=source.certifications,
            languages=source.languages,
            leadership=source.leadership,
            interests=source.interests,
            referees=source.referees,
            achievements=source.achievements,
            section_order=source.section_order,
            customization=source.customization,
            profession=source.profession,
            industry=source.industry,
            seniority=source.seniority,
            experience_level=source.experience_level,
            career_objective=source.career_objective,
            profession_confidence=source.profession_confidence,
            validation_passed=source.validation_passed,
            validation_reason=source.validation_reason,
            ats_score=source.ats_score,
            ats_analysis=source.ats_analysis
        )
        db.add(duplicated)
        db.commit()
        db.refresh(duplicated)
        return duplicated
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to duplicate resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to duplicate resume: {str(e)}")


@router.put("/{resume_id}/rename", response_model=schemas.ResumeResponse)
def rename_resume(
    resume_id: int,
    name: str = Query(..., description="The new filename or version name"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Rename a resume or a specific version name.
    """
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id, 
        models.Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
        
    try:
        if resume.parent_id is not None:
            resume.version_name = name
            # Keep structural naming consistent
            resume.filename = f"{resume.filename.split(' (')[0]} ({name})"
        else:
            resume.filename = name
            
        db.commit()
        db.refresh(resume)
        return resume
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to rename resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to rename: {str(e)}")


@router.post("/{resume_id}/ai-improve")
def ai_improve_resume(
    resume_id: int,
    request: Optional[schemas.JDMatchRequest] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Improve resume content using AI and calculate a dynamic estimated post-improvement score.
    """
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id, 
        models.Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
        
    jd_text = request.jd_text if request else None
    
    try:
        # 1. Generate text improvements (rephrase summary, polish bullets)
        improvements = generate_resume_enhancements(resume, jd_text)
        
        # 2. Evaluate current score
        current_score = resume.ats_score or 0
        if current_score == 0 and resume.ats_analysis:
            current_score = resume.ats_analysis.get("ats_score", 0)
            
        if current_score == 0:
            base_ats = evaluate_resume_ats(resume)
            current_score = base_ats.ats_score
            
        # 3. Compute estimated score after applying improvements in-memory
        virtual_resume = models.Resume(
            name=resume.name,
            email=resume.email,
            phone=resume.phone,
            raw_text=resume.raw_text,
            profession=resume.profession,
            skills=list(set((resume.skills or []) + improvements.get("keyword_suggestions", []))),
            education=resume.education,
            experience=resume.experience,
            projects=resume.projects,
            certifications=resume.certifications,
            languages=resume.languages,
            leadership=resume.leadership,
            interests=resume.interests,
            referees=resume.referees,
            achievements=resume.achievements,
            section_order=resume.section_order,
            customization=resume.customization
        )
        
        if improvements.get("improved_summary"):
            virtual_resume.summary = improvements["improved_summary"]
            virtual_resume.career_objective = improvements["improved_summary"]
            
        if improvements.get("improved_experience"):
            improved_exp_list = []
            for exp in (resume.experience or []):
                role = exp.get("role")
                company = exp.get("company")
                improved_desc = exp.get("description")
                for imp_exp in improvements["improved_experience"]:
                    if imp_exp.get("role") == role and imp_exp.get("company") == company:
                        improved_desc = imp_exp.get("improved")
                        break
                improved_exp_list.append({
                    **exp,
                    "description": improved_desc
                })
            virtual_resume.experience = improved_exp_list
            
        if improvements.get("improved_projects"):
            improved_proj_list = []
            for proj in (resume.projects or []):
                title = proj.get("title")
                improved_desc = proj.get("description")
                for imp_proj in improvements["improved_projects"]:
                    if imp_proj.get("title") == title:
                        improved_desc = imp_proj.get("improved")
                        break
                improved_proj_list.append({
                    **proj,
                    "description": improved_desc
                })
            virtual_resume.projects = improved_proj_list
            
        # Run ATS parser over the virtual model
        improved_ats_analysis = evaluate_resume_ats(virtual_resume)
        estimated_score = max(current_score, improved_ats_analysis.ats_score)
        
        return {
            "current_score": current_score,
            "estimated_score": estimated_score,
            "improvements": improvements
        }
    except Exception as e:
        logger.error(f"AI improvement generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate improvements: {str(e)}"
        )


@router.post("/{resume_id}/suggest-skills")
def suggest_skills(
    resume_id: int,
    role: Optional[str] = Query(None, description="Optional target career role"),
    request: Optional[schemas.JDMatchRequest] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Generate targeted skill suggestions based on resume, target role, and target Job Description.
    """
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id, 
        models.Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
        
    jd_text = request.jd_text if request else None
    target_role = role or resume.profession or "General Professional"
    
    # 1. Use Gemini AI if key configured
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            prompt = (
                f"You are a professional career coach. Review the candidate resume details, target role, and job description:\n\n"
                f"Candidate Current Skills: {', '.join(resume.skills or [])}\n"
                f"Target Role: {target_role}\n"
                f"Job Description: {jd_text or 'N/A'}\n\n"
                "Suggest additions to make the resume competitive. Provide:\n"
                "1. Technical Skills\n"
                "2. Soft Skills\n"
                "3. Tools (software platforms, systems)\n"
                "4. Certifications\n"
                "5. Missing Keywords (keywords from the job description not in candidate skills)\n\n"
                "Return the response as a strict JSON object with this exact structure:\n"
                "{\n"
                "  \"technical_skills\": [\"string\"],\n"
                "  \"soft_skills\": [\"string\"],\n"
                "  \"tools\": [\"string\"],\n"
                "  \"certifications\": [\"string\"],\n"
                "  \"missing_keywords\": [\"string\"]\n"
                "}"
            )
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            import json
            return json.loads(response.text)
        except Exception as e:
            logger.warning(f"Gemini skill suggestion failed, falling back to local defaults: {e}")
            
    # 2. Local Fallback logic
    try:
        from app.services.enhancement import get_profession_defaults
        defaults = get_profession_defaults(target_role)
        
        missing_keys = []
        if jd_text:
            from app.services.matcher import extract_jd_keywords
            _, missing_keys = extract_jd_keywords(jd_text)
            c_skills_lower = [s.lower() for s in (resume.skills or [])]
            missing_keys = [k for k in missing_keys if k.lower() not in c_skills_lower]
            
        return {
            "technical_skills": defaults.get("keywords", ["System Design", "Unit Testing", "API Development"])[:4],
            "soft_skills": ["Team Collaboration", "Agile Methodologies", "Problem Solving", "Technical Writing"],
            "tools": ["Git", "Docker", "JIRA", "Confluence"],
            "certifications": ["AWS Certified Solutions Architect", "Certified ScrumMaster (CSM)", "Google Cloud Engineer"],
            "missing_keywords": missing_keys[:5] if missing_keys else ["Scalability", "Security Principles", "Data Engineering"]
        }
    except Exception as e:
        logger.error(f"Fallback skill suggestion failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate skill suggestions: {str(e)}"
        )





