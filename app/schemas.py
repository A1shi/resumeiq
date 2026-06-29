from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime
import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

# --- Gemini Schema Components ---

class EducationSchema(BaseModel):
    school: Optional[str] = Field(default=None, description="Name of the university, college, or school")
    degree: Optional[str] = Field(default=None, description="Degree earned, e.g., Bachelor of Science, Master of Science")
    field_of_study: Optional[str] = Field(default=None, description="Field of study or major, e.g., Computer Science")
    start_date: Optional[str] = Field(default=None, description="Start date of study, e.g., Sept 2018 or 2018")
    end_date: Optional[str] = Field(default=None, description="End date or expected graduation date, e.g., May 2022, Present")

class ExperienceSchema(BaseModel):
    company: Optional[str] = Field(default=None, description="Name of the company or organization")
    role: Optional[str] = Field(default=None, description="Job title, e.g., Software Engineer")
    start_date: Optional[str] = Field(default=None, description="Start date, e.g., June 2022")
    end_date: Optional[str] = Field(default=None, description="End date, e.g., Present or Dec 2024")
    description: Optional[str] = Field(default=None, description="Bullet points or summary of duties and impact")

class ProjectSchema(BaseModel):
    title: Optional[str] = Field(default=None, description="Title of the project")
    description: Optional[str] = Field(default=None, description="Detailed description of what the project does")
    technologies: List[str] = Field(default_factory=list, description="Technologies or programming languages used, e.g., React, Python")

class CertificationSchema(BaseModel):
    name: str = Field(..., description="Name of the certificate")
    issuer: Optional[str] = Field(default=None, description="Organization that issued the certificate")
    date: Optional[str] = Field(default=None, description="Date of issuance or completion")
    score: Optional[str] = Field(default=None, description="Score or grade if available")

class LanguageSchema(BaseModel):
    language: str = Field(..., description="Language name, e.g., English")
    proficiency: Optional[str] = Field(default=None, description="Proficiency level, e.g., Native, Professional, Fluent")

# --- Root Parsing Schema ---

class ResumeParsedSchema(BaseModel):
    name: Optional[str] = Field(default=None, description="Full name of the candidate")
    email: Optional[str] = Field(default=None, description="Email address extracted from the resume")
    phone: Optional[str] = Field(default=None, description="Phone number extracted from the resume")
    summary: Optional[str] = Field(default=None, description="Professional summary or objective statement")
    skills: List[str] = Field(default_factory=list, description="List of technical and soft skills")
    education: List[EducationSchema] = Field(default_factory=list, description="List of education entries")
    experience: List[ExperienceSchema] = Field(default_factory=list, description="List of work experiences")
    projects: List[ProjectSchema] = Field(default_factory=list, description="List of projects")
    certifications: List[CertificationSchema] = Field(default_factory=list, description="List of certifications")
    languages: List[LanguageSchema] = Field(default_factory=list, description="List of languages")
    leadership: List[str] = Field(default_factory=list, description="Leadership roles, activities, or accomplishments")
    interests: List[str] = Field(default_factory=list, description="Personal interests, hobbies, or activities")
    referees: List[str] = Field(default_factory=list, description="References or referee contact details")
    profession: Optional[str] = Field(default=None, description="Detected profession")
    industry: Optional[str] = Field(default=None, description="Detected industry")
    seniority: Optional[str] = Field(default=None, description="Detected seniority")
    experience_level: Optional[str] = Field(default=None, description="Detected experience level")
    career_objective: Optional[str] = Field(default=None, description="Detected career objective")
    profession_confidence: Optional[float] = Field(default=None, description="Confidence score of profession detection (0.0 to 100.0)")
    validation_passed: Optional[bool] = Field(default=None, description="Whether the AI validation check passed")
    validation_reason: Optional[str] = Field(default=None, description="Reasoning behind validation check")
    parent_id: Optional[int] = Field(default=None)
    version_name: Optional[str] = Field(default=None)
    customization: Optional[dict] = Field(default_factory=dict)
    achievements: List[str] = Field(default_factory=list)
    section_order: List[str] = Field(default_factory=list)

# --- API Response Schemas ---

class JobRoleMatchSchema(BaseModel):
    role: str
    match_score: int
    skill_gaps: List[str]
    learning_roadmap: List[str]
    expected_salary: Optional[str] = None
    difficulty: Optional[str] = None

class InterviewQuestion2Schema(BaseModel):
    question: str
    difficulty: str  # "Easy", "Medium", "Hard"
    completed: bool = False
    favorite: bool = False
    needs_practice: bool = False
    sample_answer_structure: Optional[str] = None

class InterviewPrepSchema(BaseModel):
    technical_readiness: int = 0
    hr_readiness: int = 0
    communication_readiness: int = 0
    overall_readiness: int = 0
    resume_questions: List[InterviewQuestion2Schema] = Field(default_factory=list)
    jd_questions: List[InterviewQuestion2Schema] = Field(default_factory=list)
    technical_questions: List[InterviewQuestion2Schema] = Field(default_factory=list)
    hr_questions: List[InterviewQuestion2Schema] = Field(default_factory=list)
    behavioral_questions: List[InterviewQuestion2Schema] = Field(default_factory=list)
    scenario_questions: List[InterviewQuestion2Schema] = Field(default_factory=list)
    project_questions: List[InterviewQuestion2Schema] = Field(default_factory=list)
    problem_solving_questions: List[InterviewQuestion2Schema] = Field(default_factory=list)

class ATSAnalysisSchema(BaseModel):
    ats_score: int
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    recommended_skills: List[str] = Field(default_factory=list)
    recommended_job_roles: List[str] = Field(default_factory=list)
    interview_readiness_score: int
    missing_sections: List[str] = Field(default_factory=list)
    
    # Detailed scoring breakdown
    contact_score: int = 0
    summary_score: int = 0
    skills_score: int = 0
    experience_score: int = 0
    projects_score: int = 0
    education_score: int = 0
    certifications_score: int = 0
    formatting_score: int = 0
    keyword_score: int = 0
    
    # Deductions explanations
    deductions: List[str] = Field(default_factory=list)
    
    # Additional Scores
    resume_improvement_score: int = 0
    job_readiness_score: int = 0
    
    # Recruiter review & weaknesses
    recruiter_strengths: List[str] = Field(default_factory=list)
    recruiter_concerns: List[str] = Field(default_factory=list)
    resume_weaknesses: List[str] = Field(default_factory=list)
    
    # Job Roles & Roadmaps
    top_job_roles: List[JobRoleMatchSchema] = Field(default_factory=list)
    improvement_roadmap: List[str] = Field(default_factory=list)
    personalized_learning_roadmap: List[str] = Field(default_factory=list)

    # --- Phase 5 Resume Overview Additions ---
    candidate_profile: str = ""
    career_level: str = ""
    industry_classification: str = ""
    experience_level: str = ""
    professional_summary: str = ""

    # --- Phase 4 Universal ATS Report 2.0 Additions ---
    readiness_level: str = "Developing" # Beginner, Developing, Competitive, Strong Candidate, Interview Ready
    
    # Category score justifications
    contact_reason: str = ""
    summary_reason: str = ""
    skills_reason: str = ""
    experience_reason: str = ""
    projects_reason: str = ""
    education_reason: str = ""
    certifications_reason: str = ""
    formatting_reason: str = ""
    keyword_reason: str = ""
    
    # Recruiter View
    recruiters_like: List[str] = Field(default_factory=list)
    recruiters_reject: List[str] = Field(default_factory=list)
    top_risks: List[str] = Field(default_factory=list)
    confidence_level: str = "Medium" # Low, Medium, High
    
    # Skill Gap Analysis
    current_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    future_skills: List[str] = Field(default_factory=list)
    high_priority_gaps: List[str] = Field(default_factory=list)
    medium_priority_gaps: List[str] = Field(default_factory=list)
    low_priority_gaps: List[str] = Field(default_factory=list)
    
    # Career Roadmap
    seven_day_plan: List[str] = Field(default_factory=list)
    thirty_day_plan: List[str] = Field(default_factory=list)
    sixty_day_plan: List[str] = Field(default_factory=list)
    ninety_day_plan: List[str] = Field(default_factory=list)
    
    # AI Resume Enhancement
    improved_summary: str = ""
    improved_experience: List[dict] = Field(default_factory=list)
    improved_projects: List[dict] = Field(default_factory=list)
    improved_skills: List[str] = Field(default_factory=list)
    keyword_suggestions: List[str] = Field(default_factory=list)
    
    # Job Application Toolkit
    professional_cover_letter: str = ""
    short_cover_letter: str = ""
    email_application: str = ""
    linkedin_outreach: str = ""
    recruiter_intro: str = ""
    
    # Interview Preparation
    hr_questions: List[str] = Field(default_factory=list)
    technical_questions: List[str] = Field(default_factory=list)
    resume_questions: List[str] = Field(default_factory=list)
    project_questions: List[str] = Field(default_factory=list)
    behavioral_questions: List[str] = Field(default_factory=list)
    interview_prep: Optional[InterviewPrepSchema] = None

class ResumeResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    summary: Optional[str] = None
    skills: List[str]
    education: List[EducationSchema]
    experience: List[ExperienceSchema]
    projects: List[ProjectSchema]
    certifications: List[CertificationSchema] = Field(default_factory=list)
    languages: List[LanguageSchema] = Field(default_factory=list)
    leadership: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    referees: List[str] = Field(default_factory=list)
    ats_score: Optional[int] = None
    ats_analysis: Optional[ATSAnalysisSchema] = None
    profession: Optional[str] = None
    industry: Optional[str] = None
    seniority: Optional[str] = None
    experience_level: Optional[str] = None
    career_objective: Optional[str] = None
    profession_confidence: Optional[float] = None
    validation_passed: Optional[bool] = None
    validation_reason: Optional[str] = None
    parent_id: Optional[int] = None
    version_name: Optional[str] = None
    customization: Optional[dict] = {}
    achievements: Optional[List[str]] = []
    section_order: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResumeListResponse(BaseModel):
    id: int
    filename: str
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    skills: List[str]
    ats_score: Optional[int] = None
    latest_match_score: Optional[int] = None
    latest_match_title: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class JDMatchRequest(BaseModel):
    jd_text: Optional[str] = None
    job_role: Optional[str] = None


class ToggleStatusRequest(BaseModel):
    category: str
    question_idx: int
    status_type: str


class ExperienceMatchSchema(BaseModel):
    required_experience: str = ""
    detected_experience: str = ""
    gap_analysis: str = ""


class CertificationMatchSchema(BaseModel):
    required_certifications: List[str] = Field(default_factory=list)
    detected_certifications: List[str] = Field(default_factory=list)
    missing_certifications: List[str] = Field(default_factory=list)


class JDMatchResponse(BaseModel):
    id: int
    resume_id: int
    job_title: Optional[str] = None
    match_score: int
    matching_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    skill_gaps: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    most_important_missing_keywords: List[str] = Field(default_factory=list)
    experience_match: Optional[ExperienceMatchSchema] = None
    certification_match: Optional[CertificationMatchSchema] = None
    interview_questions: List[InterviewQuestion2Schema] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


class RecruiterSimulationRequest(BaseModel):
    jd_text: str


class RecruiterSimulationSchema(BaseModel):
    decision: str = Field(..., description="Recruiter screening decision. Must be exactly 'Shortlist', 'Maybe', or 'Reject'.")
    reasoning: str = Field(..., description="Detailed explanation of the decision based on matching candidate profile with JD requirements.")
    strengths: List[str] = Field(..., description="List of the top 3 biggest strengths or positive matching qualifiers.")
    concerns: List[str] = Field(..., description="List of the top 3 biggest concerns, risks, or skill gaps.")
    interview_probability: int = Field(..., description="Percentage score (0 to 100) indicating chance of landing an interview.")
    suggested_improvements: List[str] = Field(..., description="3 to 5 actionable suggestions to improve candidate resume/fit for this JD.")


class RecruiterSimulationResponse(BaseModel):
    id: int
    resume_id: int
    jd_text: str
    decision: str
    reasoning: str
    strengths: List[str]
    concerns: List[str]
    interview_probability: int
    suggested_improvements: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- User Schemas ---

class UserCreate(BaseModel):
    email: str = Field(..., description="Email address of the user")
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name of the user")
    password: str = Field(..., min_length=6, description="Password of the user")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_REGEX.match(v):
            raise ValueError("value is not a valid email address")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v.strip()) < 6:
            raise ValueError("Password must be at least 6 characters and cannot be all whitespace")
        return v


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    is_verified: bool
    created_at: datetime
    otp: Optional[str] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str = Field(..., description="Email address of the user")
    password: str = Field(..., description="Password of the user")
    remember_me: Optional[bool] = Field(default=False, description="Whether to keep the session active for 30 days")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_REGEX.match(v):
            raise ValueError("value is not a valid email address")
        return v.lower()


class UserUpdate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name of the user")
    email: str = Field(..., description="Email address of the user")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_REGEX.match(v):
            raise ValueError("value is not a valid email address")
        return v.lower()


class PasswordChange(BaseModel):
    old_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=6, description="New password")

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v.strip()) < 6:
            raise ValueError("Password must be at least 6 characters and cannot be all whitespace")
        return v


class UserVerify(BaseModel):
    email: str = Field(..., description="Email address of the user")
    token: str = Field(..., description="6-digit verification code")
    remember_me: Optional[bool] = Field(default=False, description="Whether to keep the session active for 30 days")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_REGEX.match(v):
            raise ValueError("value is not a valid email address")
        return v.lower()


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="Email address of the user")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_REGEX.match(v):
            raise ValueError("value is not a valid email address")
        return v.lower()


class CoverLetterRequest(BaseModel):
    job_title: str = Field(..., min_length=1, description="Target job title")
    company_name: str = Field(..., min_length=1, description="Target company name")
    industry: Optional[str] = Field(default=None, description="Target industry")


class CoverLetterExportRequest(BaseModel):
    text: str = Field(..., min_length=1, description="The cover letter text to export")
    format: str = Field(..., description="Export format, 'pdf' or 'docx'")
    filename: Optional[str] = Field(default=None, description="Optional custom filename")


class ResumeExportRequest(BaseModel):
    template_name: str = Field(..., description="The name/ID of the template")
    format: str = Field(..., description="Export format, 'pdf' or 'docx'")
    resume_data: Optional[ResumeParsedSchema] = Field(default=None, description="Optional custom resume data")
    customization: Optional[dict] = Field(default=None, description="Optional custom styling preferences")


class TemplateResponse(BaseModel):
    name: str = Field(..., description="The name of the template")
    description: str = Field(..., description="Description of the template's style and use case")
    category: str = Field(..., description="Category of the template")
    supported_formats: List[str] = Field(..., description="Supported export formats, e.g. ['pdf', 'docx']")


class ResetPasswordRequest(BaseModel):
    email: str = Field(..., description="Email address of the user")
    token: str = Field(..., description="6-digit reset password code")
    new_password: str = Field(..., min_length=6, description="New password")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_REGEX.match(v):
            raise ValueError("value is not a valid email address")
        return v.lower()

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v.strip()) < 6:
            raise ValueError("Password must be at least 6 characters and cannot be all whitespace")
        return v


class RecentAnalysisItem(BaseModel):
    id: int
    filename: str
    name: Optional[str] = None
    ats_score: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    total_resumes: int
    average_ats_score: float
    highest_ats_score: int
    recent_analyses: List[RecentAnalysisItem]


class ResumeRestoreSchema(BaseModel):
    filename: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    education: List[EducationSchema] = Field(default_factory=list)
    experience: List[ExperienceSchema] = Field(default_factory=list)
    projects: List[ProjectSchema] = Field(default_factory=list)
    certifications: List[CertificationSchema] = Field(default_factory=list)
    languages: List[LanguageSchema] = Field(default_factory=list)
    leadership: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    referees: List[str] = Field(default_factory=list)
    customization: Optional[dict] = {}
    achievements: Optional[List[str]] = []
    section_order: Optional[List[str]] = []
    ats_score: Optional[int] = None
    ats_analysis: Optional[ATSAnalysisSchema] = None
    profession: Optional[str] = None
    industry: Optional[str] = None
    seniority: Optional[str] = None
    experience_level: Optional[str] = None
    career_objective: Optional[str] = None



