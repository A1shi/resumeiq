import os
import shutil
import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
import app.models as models
import app.schemas as schemas
from app.services.matcher import match_resume_with_jd
from app.services.recruiter import simulate_candidate_recruitment
from app.services.security import get_current_verified_user
from app.services.cover_letter import generate_cover_letter_text, generate_cover_letter_versions
from app.services.pdf_generator import generate_cover_letter_pdf, generate_jd_match_pdf_report
from app.services.docx_generator import generate_cover_letter_docx

router = APIRouter(prefix="/resumes", tags=["Job Description Matching"])
logger = logging.getLogger("app.routers.match")

@router.post("/{resume_id}/match", response_model=schemas.JDMatchResponse, status_code=status.HTTP_200_OK)
def match_resume(
    resume_id: int,
    request: schemas.JDMatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Compare a parsed resume against a provided job description text to compute a match score,
    matching and missing keywords, skill gaps, and recommendations.
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
        # Run matching engine using the raw text of the resume
        match_result = match_resume_with_jd(resume.raw_text, request.jd_text)

        # Store in database
        db_match = models.JobMatch(
            resume_id=resume.id,
            user_id=current_user.id,
            job_title=match_result.get("job_title"),
            jd_text=request.jd_text,
            match_score=match_result.get("match_score", 0),
            matching_keywords=match_result.get("matching_keywords", []),
            missing_keywords=match_result.get("missing_keywords", []),
            skill_gaps=match_result.get("skill_gaps", []),
            recommendations=match_result.get("recommendations", []),
            most_important_missing_keywords=match_result.get("most_important_missing_keywords", []),
            experience_match=match_result.get("experience_match", {}),
            certification_match=match_result.get("certification_match", {}),
            interview_questions=match_result.get("interview_questions", [])
        )
        db.add(db_match)
        db.commit()
        db.refresh(db_match)

        return db_match
    except Exception as e:
        logger.error(f"Failed to match resume with JD: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job Description matching failed: {str(e)}"
        )

@router.get("/{resume_id}/matches", response_model=List[schemas.JDMatchResponse])
def get_resume_matches(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Retrieve all past job matches for a specific resume.
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
    
    matches = db.query(models.JobMatch).filter(
        models.JobMatch.resume_id == resume_id,
        models.JobMatch.user_id == current_user.id
    ).order_by(models.JobMatch.created_at.desc()).all()
    return matches


@router.post("/{resume_id}/simulate-recruiter", response_model=schemas.RecruiterSimulationResponse, status_code=status.HTTP_200_OK)
def simulate_recruiter_screening(
    resume_id: int,
    request: schemas.RecruiterSimulationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Simulate a recruiter screening a candidate's resume against a provided job description.
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
        # Run recruiter simulator
        simulation_data = simulate_candidate_recruitment(resume.raw_text, request.jd_text)

        # Store in database
        db_simulation = models.RecruiterSimulation(
            resume_id=resume.id,
            user_id=current_user.id,
            jd_text=request.jd_text,
            decision=simulation_data["decision"],
            reasoning=simulation_data["reasoning"],
            strengths=simulation_data["strengths"],
            concerns=simulation_data["concerns"],
            interview_probability=simulation_data["interview_probability"],
            suggested_improvements=simulation_data["suggested_improvements"]
        )
        db.add(db_simulation)
        db.commit()
        db.refresh(db_simulation)

        return db_simulation
    except Exception as e:
        logger.error(f"Recruiter simulation failed: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recruiter simulation failed: {str(e)}"
        )


@router.get("/{resume_id}/simulations", response_model=List[schemas.RecruiterSimulationResponse])
def get_resume_simulations(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Retrieve all past recruiter simulations for a specific resume.
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
    
    simulations = db.query(models.RecruiterSimulation).filter(
        models.RecruiterSimulation.resume_id == resume_id,
        models.RecruiterSimulation.user_id == current_user.id
    ).order_by(models.RecruiterSimulation.created_at.desc()).all()
    return simulations


@router.post("/{resume_id}/cover-letter")
def generate_cover_letter(
    resume_id: int,
    request: schemas.CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Generate three versions (Professional, Entry-Level, Experienced) of a cover letter based on the candidate's resume and job target.
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
        versions = generate_cover_letter_versions(resume, request.job_title, request.company_name, request.industry)
        return versions
    except Exception as e:
        logger.error(f"Failed to generate cover letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cover Letter generation failed: {str(e)}"
        )


@router.post("/cover-letter/export")
def export_cover_letter_raw(
    request: schemas.CoverLetterExportRequest,
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Export raw text cover letter (possibly custom-edited on frontend) to PDF or DOCX.
    """
    try:
        fmt = request.format.lower()
        if fmt == "docx":
            file_stream = generate_cover_letter_docx(request.text)
            ext = "docx"
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        elif fmt == "pdf":
            file_stream = generate_cover_letter_pdf(request.text)
            ext = "pdf"
            media_type = "application/pdf"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported export format. Must be 'pdf' or 'docx'."
            )
            
        custom_filename = request.filename or f"Cover_Letter"
        if not custom_filename.endswith(f".{ext}"):
            filename = f"{custom_filename}.{ext}"
        else:
            filename = custom_filename
            
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
        logger.error(f"Failed to export cover letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cover Letter export failed: {str(e)}"
        )


@router.post("/{resume_id}/cover-letter/download")
def download_cover_letter(
    resume_id: int,
    request: schemas.CoverLetterRequest,
    format: str = "pdf",  # "pdf" or "docx"
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Download the generated cover letter as a PDF or Word document (.docx).
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
        text = generate_cover_letter_text(resume, request.job_title, request.company_name)
        if format.lower() == "docx":
            file_stream = generate_cover_letter_docx(text)
            filename = f"Cover_Letter_{resume.name or 'Candidate'}.docx"
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            file_stream = generate_cover_letter_pdf(text)
            filename = f"Cover_Letter_{resume.name or 'Candidate'}.pdf"
            media_type = "application/pdf"
            
        return StreamingResponse(
            file_stream,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        logger.error(f"Failed to export cover letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cover Letter export failed: {str(e)}"
        )


@router.post("/jd/upload", status_code=status.HTTP_200_OK)
async def upload_jd_file(
    file: UploadFile = File(..., description="PDF, DOCX, or TXT Job Description file")
):
    """
    Upload a job description file, extract the text contents, and return it.
    """
    filename = file.filename
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File has no filename."
        )
    _, ext = os.path.splitext(filename.lower())
    if ext not in {".pdf", ".docx", ".txt"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Only PDF, DOCX, and TXT files are allowed."
        )
    
    os.makedirs("uploads", exist_ok=True)
    safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-").strip()
    temp_path = os.path.join("uploads", f"temp_jd_{safe_filename}")
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded JD file."
        )
        
    try:
        if ext == ".txt":
            with open(temp_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        else:
            from app.services.extractor import extract_text
            text = extract_text(temp_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract text from Job Description: {str(e)}"
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    return {"jd_text": text}


@router.get("/{resume_id}/matches/{match_id}/export-pdf")
def export_match_report_pdf(
    resume_id: int,
    match_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Generate and download a professional PDF evaluation report for a JD Match.
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
        
    match = db.query(models.JobMatch).filter(
        models.JobMatch.id == match_id,
        models.JobMatch.resume_id == resume_id,
        models.JobMatch.user_id == current_user.id
    ).first()
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job Match with ID {match_id} not found."
        )
        
    try:
        file_stream = generate_jd_match_pdf_report(resume, match)
        filename = f"JD_Match_Report_{resume.name or 'Candidate'}_{match.job_title or 'Job'}.pdf"
        filename = "".join(c for c in filename if c.isalnum() or c in "._-").strip()
        
        return StreamingResponse(
            file_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        logger.error(f"Failed to export JD Match PDF report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export JD Match PDF report: {str(e)}"
        )

