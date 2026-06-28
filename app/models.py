import datetime
from typing import Any, List, Dict, Optional
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, func, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Any = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name: Any = Column(String(255), nullable=False)
    email: Any = Column(String(255), nullable=False, unique=True, index=True)
    password_hash: Any = Column(String(255), nullable=False)
    created_at: Any = Column(DateTime, default=func.now(), nullable=False)

    # Email verification and password reset fields
    is_verified: Any = Column(Boolean, default=False, nullable=False)
    verification_token: Any = Column(String(255), nullable=True)
    verification_token_expires: Any = Column(DateTime, nullable=True)
    verification_token_sent_at: Any = Column(DateTime, nullable=True)
    reset_token: Any = Column(String(255), nullable=True)
    reset_token_expires: Any = Column(DateTime, nullable=True)
    reset_token_sent_at: Any = Column(DateTime, nullable=True)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    matches = relationship("JobMatch", back_populates="user", cascade="all, delete-orphan")
    simulations = relationship("RecruiterSimulation", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id: Any = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Any = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    filename: Any = Column(String(255), nullable=False)
    file_path: Any = Column(String(512), nullable=False)
    raw_text: Any = Column(Text, nullable=False)
    
    # Parsed standard information
    name: Any = Column(String(255), nullable=True)
    email: Any = Column(String(255), nullable=True, index=True)
    phone: Any = Column(String(50), nullable=True)
    summary: Any = Column(Text, nullable=True)
    
    # Phase 2 - Profession Detection & AI validation info
    profession: Any = Column(String(255), nullable=True)
    industry: Any = Column(String(255), nullable=True)
    seniority: Any = Column(String(255), nullable=True)
    experience_level: Any = Column(String(255), nullable=True)
    career_objective: Any = Column(Text, nullable=True)
    profession_confidence: Any = Column(Integer, nullable=True)
    validation_passed: Any = Column(Boolean, nullable=True)
    validation_reason: Any = Column(Text, nullable=True)
    
    # Complex fields stored as JSON arrays of objects/strings
    skills: Any = Column(JSON, nullable=False, default=list)
    education: Any = Column(JSON, nullable=False, default=list)
    experience: Any = Column(JSON, nullable=False, default=list)
    projects: Any = Column(JSON, nullable=False, default=list)
    certifications: Any = Column(JSON, nullable=False, default=list)
    languages: Any = Column(JSON, nullable=False, default=list)
    leadership: Any = Column(JSON, nullable=False, default=list)
    interests: Any = Column(JSON, nullable=False, default=list)
    referees: Any = Column(JSON, nullable=False, default=list)
    
    # Phase 6 additions
    parent_id: Any = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=True)
    version_name: Any = Column(String(255), nullable=True)
    customization: Any = Column(JSON, nullable=False, default=dict)
    achievements: Any = Column(JSON, nullable=False, default=list)
    section_order: Any = Column(JSON, nullable=False, default=list)
    
    # ATS Scoring Cache Fields
    ats_score: Any = Column(Integer, nullable=True)
    ats_analysis: Any = Column(JSON, nullable=True)
    
    created_at: Any = Column(DateTime, default=func.now(), nullable=False)
    updated_at: Any = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="resumes")
    matches = relationship("JobMatch", back_populates="resume", cascade="all, delete-orphan")
    simulations = relationship("RecruiterSimulation", back_populates="resume", cascade="all, delete-orphan")

    @property
    def latest_match_score(self) -> Optional[int]:
        if not self.matches:
            return None
        # Sort matches by ID descending (most recent first)
        sorted_matches = sorted(list(self.matches), key=lambda m: m.id, reverse=True)
        return sorted_matches[0].match_score

    @property
    def latest_match_title(self) -> Optional[str]:
        if not self.matches:
            return None
        sorted_matches = sorted(list(self.matches), key=lambda m: m.id, reverse=True)
        return sorted_matches[0].job_title



class JobMatch(Base):
    __tablename__ = "job_matches"

    id: Any = Column(Integer, primary_key=True, index=True, autoincrement=True)
    resume_id: Any = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    user_id: Any = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    job_title: Any = Column(String(255), nullable=True)
    jd_text: Any = Column(Text, nullable=False)
    match_score: Any = Column(Integer, nullable=False)
    matching_keywords: Any = Column(JSON, nullable=False, default=list)
    missing_keywords: Any = Column(JSON, nullable=False, default=list)
    skill_gaps: Any = Column(JSON, nullable=False, default=list)
    recommendations: Any = Column(JSON, nullable=False, default=list)
    most_important_missing_keywords: Any = Column(JSON, nullable=False, default=list)
    experience_match: Any = Column(JSON, nullable=False, default=dict)
    certification_match: Any = Column(JSON, nullable=False, default=dict)
    interview_questions: Any = Column(JSON, nullable=False, default=list)
    created_at: Any = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    resume = relationship("Resume", back_populates="matches")
    user = relationship("User", back_populates="matches")


class RecruiterSimulation(Base):
    __tablename__ = "recruiter_simulations"

    id: Any = Column(Integer, primary_key=True, index=True, autoincrement=True)
    resume_id: Any = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    user_id: Any = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    jd_text: Any = Column(Text, nullable=False)
    decision: Any = Column(String(50), nullable=False)  # Shortlist, Maybe, Reject
    reasoning: Any = Column(Text, nullable=False)
    strengths: Any = Column(JSON, nullable=False, default=list)
    concerns: Any = Column(JSON, nullable=False, default=list)
    interview_probability: Any = Column(Integer, nullable=False)
    suggested_improvements: Any = Column(JSON, nullable=False, default=list)
    created_at: Any = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    resume = relationship("Resume", back_populates="simulations")
    user = relationship("User", back_populates="simulations")


