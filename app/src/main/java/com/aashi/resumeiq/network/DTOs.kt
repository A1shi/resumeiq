package com.aashi.resumeiq.network

import com.google.gson.annotations.SerializedName

// --- User & Auth DTOs ---

data class UserCreate(
    val email: String,
    @SerializedName("full_name") val fullName: String,
    val password: String
)

data class UserLogin(
    val email: String,
    val password: String,
    @SerializedName("remember_me") val rememberMe: Boolean = false
)

data class UserResponse(
    val id: Int,
    @SerializedName("full_name") val fullName: String,
    val email: String,
    @SerializedName("is_verified") val isVerified: Boolean,
    @SerializedName("created_at") val createdAt: String,
    val otp: String? = null
)

data class LoginResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("token_type") val tokenType: String,
    val user: UserResponse
)

data class UserVerify(
    val email: String,
    val token: String
)

data class ForgotPasswordRequest(
    val email: String
)

data class ResetPasswordRequest(
    val email: String,
    val token: String,
    @SerializedName("new_password") val newPassword: String
)

data class PasswordChange(
    @SerializedName("old_password") val oldPassword: String,
    @SerializedName("new_password") val newPassword: String
)

data class UserUpdate(
    @SerializedName("full_name") val fullName: String,
    val email: String
)

data class MessageResponse(
    val message: String,
    val otp: String? = null
)

// --- Resume DTOs ---

data class EducationSchema(
    val school: String?,
    val degree: String?,
    @SerializedName("field_of_study") val fieldOfStudy: String?,
    @SerializedName("start_date") val startDate: String?,
    @SerializedName("end_date") val endDate: String?
)

data class ExperienceSchema(
    val company: String?,
    val role: String?,
    @SerializedName("start_date") val startDate: String?,
    @SerializedName("end_date") val endDate: String?,
    val description: String?
)

data class ProjectSchema(
    val title: String?,
    val description: String?,
    val technologies: List<String> = emptyList()
)

data class CertificationSchema(
    val name: String,
    val issuer: String?,
    val date: String?,
    val score: String?
)

data class LanguageSchema(
    val language: String,
    val proficiency: String?
)

data class ResumeParsedSchema(
    val name: String?,
    val email: String?,
    val phone: String?,
    val skills: List<String> = emptyList(),
    val education: List<EducationSchema> = emptyList(),
    val experience: List<ExperienceSchema> = emptyList(),
    val projects: List<ProjectSchema> = emptyList(),
    val certifications: List<CertificationSchema> = emptyList(),
    val languages: List<LanguageSchema> = emptyList()
)

data class JobRoleMatchSchema(
    val role: String,
    @SerializedName("match_score") val matchScore: Int,
    @SerializedName("skill_gaps") val skillGaps: List<String> = emptyList(),
    @SerializedName("learning_roadmap") val learningRoadmap: List<String> = emptyList(),
    @SerializedName("expected_salary") val expectedSalary: String?,
    val difficulty: String?
)

data class InterviewQuestion2Schema(
    val question: String,
    val difficulty: String,
    @SerializedName("key_points") val keyPoints: List<String> = emptyList(),
    @SerializedName("sample_answer_structure") val sampleAnswerStructure: String = ""
)

data class InterviewPrepSchema(
    @SerializedName("technical_readiness") val technicalReadiness: Int = 0,
    @SerializedName("hr_readiness") val hrReadiness: Int = 0,
    @SerializedName("communication_readiness") val communicationReadiness: Int = 0,
    @SerializedName("overall_readiness") val overallReadiness: Int = 0,
    @SerializedName("hr_questions") val hrQuestions: List<InterviewQuestion2Schema> = emptyList(),
    @SerializedName("technical_questions") val technicalQuestions: List<InterviewQuestion2Schema> = emptyList(),
    @SerializedName("jd_questions") val jdQuestions: List<InterviewQuestion2Schema> = emptyList(),
    @SerializedName("project_questions") val projectQuestions: List<InterviewQuestion2Schema> = emptyList(),
    @SerializedName("resume_questions") val resumeQuestions: List<InterviewQuestion2Schema> = emptyList(),
    @SerializedName("behavioral_questions") val behavioralQuestions: List<InterviewQuestion2Schema> = emptyList()
)

data class ATSAnalysisSchema(
    @SerializedName("ats_score") val atsScore: Int,
    val strengths: List<String> = emptyList(),
    val weaknesses: List<String> = emptyList(),
    @SerializedName("missing_keywords") val missingKeywords: List<String> = emptyList(),
    @SerializedName("recommended_skills") val recommendedSkills: List<String> = emptyList(),
    @SerializedName("recommended_job_roles") val recommendedJobRoles: List<String> = emptyList(),
    @SerializedName("interview_readiness_score") val interviewReadinessScore: Int,
    @SerializedName("missing_sections") val missingSections: List<String> = emptyList(),
    
    // Detailed scoring breakdown
    @SerializedName("contact_score") val contactScore: Int = 0,
    @SerializedName("summary_score") val summaryScore: Int = 0,
    @SerializedName("skills_score") val skillsScore: Int = 0,
    @SerializedName("experience_score") val experienceScore: Int = 0,
    @SerializedName("projects_score") val projectsScore: Int = 0,
    @SerializedName("education_score") val educationScore: Int = 0,
    @SerializedName("certifications_score") val certificationsScore: Int = 0,
    @SerializedName("formatting_score") val formattingScore: Int = 0,
    @SerializedName("keyword_score") val keywordScore: Int = 0,
    
    val deductions: List<String> = emptyList(),
    @SerializedName("resume_improvement_score") val resumeImprovementScore: Int = 0,
    @SerializedName("job_readiness_score") val jobReadinessScore: Int = 0,
    
    @SerializedName("recruiter_strengths") val recruiterStrengths: List<String> = emptyList(),
    @SerializedName("recruiter_concerns") val recruiterConcerns: List<String> = emptyList(),
    @SerializedName("resume_weaknesses") val resumeWeaknesses: List<String> = emptyList(),
    @SerializedName("top_job_roles") val topJobRoles: List<JobRoleMatchSchema> = emptyList(),
    @SerializedName("improvement_roadmap") val improvementRoadmap: List<String> = emptyList(),
    @SerializedName("personalized_learning_roadmap") val personalizedLearningRoadmap: List<String> = emptyList(),

    @SerializedName("candidate_profile") val candidateProfile: String = "",
    @SerializedName("career_level") val careerLevel: String = "",
    @SerializedName("industry_classification") val industryClassification: String = "",
    @SerializedName("experience_level") val experienceLevel: String = "",
    @SerializedName("professional_summary") val professionalSummary: String = "",
    @SerializedName("readiness_level") val readinessLevel: String = "Developing",
    
    // Category score justifications
    @SerializedName("contact_reason") val contactReason: String = "",
    @SerializedName("summary_reason") val summaryReason: String = "",
    @SerializedName("skills_reason") val skillsReason: String = "",
    @SerializedName("experience_reason") val experienceReason: String = "",
    @SerializedName("projects_reason") val projectsReason: String = "",
    @SerializedName("education_reason") val educationReason: String = "",
    @SerializedName("certifications_reason") val certificationsReason: String = "",
    @SerializedName("formatting_reason") val formattingReason: String = "",
    @SerializedName("keyword_reason") val keywordReason: String = "",
    
    @SerializedName("recruiters_like") val recruitersLike: List<String> = emptyList(),
    @SerializedName("recruiters_reject") val recruitersReject: List<String> = emptyList(),
    @SerializedName("top_risks") val topRisks: List<String> = emptyList(),
    @SerializedName("confidence_level") val confidenceLevel: String = "Medium",
    
    @SerializedName("current_skills") val currentSkills: List<String> = emptyList(),
    @SerializedName("missing_skills") val missingSkills: List<String> = emptyList(),
    @SerializedName("future_skills") val futureSkills: List<String> = emptyList(),
    @SerializedName("high_priority_gaps") val highPriorityGaps: List<String> = emptyList(),
    @SerializedName("medium_priority_gaps") val mediumPriorityGaps: List<String> = emptyList(),
    @SerializedName("low_priority_gaps") val lowPriorityGaps: List<String> = emptyList(),
    
    @SerializedName("seven_day_plan") val sevenDayPlan: List<String> = emptyList(),
    @SerializedName("thirty_day_plan") val thirtyDayPlan: List<String> = emptyList(),
    @SerializedName("sixty_day_plan") val sixtyDayPlan: List<String> = emptyList(),
    @SerializedName("ninety_day_plan") val ninetyDayPlan: List<String> = emptyList(),
    
    @SerializedName("improved_summary") val improvedSummary: String = "",
    @SerializedName("improved_experience") val improvedExperience: List<Map<String, Any>> = emptyList(),
    @SerializedName("improved_projects") val improvedProjects: List<Map<String, Any>> = emptyList(),
    @SerializedName("improved_skills") val improvedSkills: List<String> = emptyList(),
    @SerializedName("keyword_suggestions") val keywordSuggestions: List<String> = emptyList(),
    
    @SerializedName("professional_cover_letter") val professionalCoverLetter: String = "",
    @SerializedName("short_cover_letter") val shortCoverLetter: String = "",
    @SerializedName("email_application") val emailApplication: String = "",
    @SerializedName("linkedin_outreach") val linkedinOutreach: String = "",
    @SerializedName("recruiter_intro") val recruiterIntro: String = "",
    
    @SerializedName("hr_questions") val hrQuestions: List<String> = emptyList(),
    @SerializedName("technical_questions") val technicalQuestions: List<String> = emptyList(),
    @SerializedName("resume_questions") val resumeQuestions: List<String> = emptyList(),
    @SerializedName("project_questions") val projectQuestions: List<String> = emptyList(),
    @SerializedName("behavioral_questions") val behavioralQuestions: List<String> = emptyList(),
    @SerializedName("interview_prep") val interviewPrep: InterviewPrepSchema? = null
)

data class ResumeResponse(
    val id: Int,
    val filename: String,
    @SerializedName("file_path") val filePath: String,
    val name: String?,
    val email: String?,
    val phone: String?,
    val skills: List<String> = emptyList(),
    val education: List<EducationSchema> = emptyList(),
    val experience: List<ExperienceSchema> = emptyList(),
    val projects: List<ProjectSchema> = emptyList(),
    val certifications: List<CertificationSchema> = emptyList(),
    val languages: List<LanguageSchema> = emptyList(),
    @SerializedName("ats_score") val atsScore: Int?,
    @SerializedName("ats_analysis") val atsAnalysis: ATSAnalysisSchema?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

data class ResumeListResponse(
    val id: Int,
    val filename: String,
    val name: String?,
    val email: String?,
    val phone: String?,
    val skills: List<String> = emptyList(),
    @SerializedName("ats_score") val atsScore: Int?,
    @SerializedName("created_at") val createdAt: String
)

data class JDMatchRequest(
    @SerializedName("jd_text") val jdText: String
)

data class ResumeExportRequest(
    @SerializedName("template_name") val templateName: String,
    val format: String,
    @SerializedName("resume_data") val resumeData: ResumeParsedSchema? = null
)

data class CoverLetterExportRequest(
    val text: String,
    val format: String,
    val filename: String? = null
)

data class ExperienceMatchSchema(
    @SerializedName("required_experience") val requiredExperience: String = "",
    @SerializedName("detected_experience") val detectedExperience: String = "",
    @SerializedName("gap_analysis") val gapAnalysis: String = ""
)

data class CertificationMatchSchema(
    @SerializedName("required_certifications") val requiredCertifications: List<String> = emptyList(),
    @SerializedName("detected_certifications") val detectedCertifications: List<String> = emptyList(),
    @SerializedName("missing_certifications") val missingCertifications: List<String> = emptyList()
)

data class JDMatchResponse(
    val id: Int,
    @SerializedName("resume_id") val resumeId: Int,
    @SerializedName("job_title") val jobTitle: String?,
    @SerializedName("match_score") val matchScore: Int,
    @SerializedName("matching_keywords") val matchingKeywords: List<String> = emptyList(),
    @SerializedName("missing_keywords") val missingKeywords: List<String> = emptyList(),
    @SerializedName("skill_gaps") val skillGaps: List<String> = emptyList(),
    val recommendations: List<String> = emptyList(),
    @SerializedName("most_important_missing_keywords") val mostImportantMissingKeywords: List<String> = emptyList(),
    @SerializedName("experience_match") val experienceMatch: ExperienceMatchSchema?,
    @SerializedName("certification_match") val certificationMatch: CertificationMatchSchema?,
    @SerializedName("interview_questions") val interviewQuestions: List<InterviewQuestion2Schema> = emptyList(),
    @SerializedName("created_at") val createdAt: String
)

data class RecruiterSimulationRequest(
    @SerializedName("jd_text") val jdText: String
)

data class RecruiterSimulationResponse(
    val id: Int,
    @SerializedName("resume_id") val resumeId: Int,
    @SerializedName("jd_text") val jdText: String,
    val decision: String,
    val reasoning: String,
    val strengths: List<String> = emptyList(),
    val concerns: List<String> = emptyList(),
    @SerializedName("interview_probability") val interviewProbability: Int,
    @SerializedName("suggested_improvements") val suggestedImprovements: List<String> = emptyList(),
    @SerializedName("created_at") val createdAt: String
)

data class CoverLetterRequest(
    @SerializedName("job_title") val jobTitle: String,
    @SerializedName("company_name") val companyName: String,
    val industry: String? = null
)

data class CoverLetterVersionsResponse(
    val professional: String,
    @SerializedName("entry_level") val entryLevel: String,
    val experienced: String
)

data class DashboardStatsResponse(
    @SerializedName("total_resumes") val totalResumes: Int,
    @SerializedName("average_ats_score") val averageAtsScore: Double,
    @SerializedName("highest_ats_score") val highestAtsScore: Int,
    @SerializedName("recent_analyses") val recentAnalyses: List<RecentAnalysisItem> = emptyList()
)

data class RecentAnalysisItem(
    val id: Int,
    val filename: String,
    val name: String?,
    @SerializedName("ats_score") val atsScore: Int?,
    @SerializedName("created_at") val createdAt: String
)

data class TemplateItemResponse(
    val name: String,
    val description: String,
    val category: String,
    @SerializedName("supported_formats") val supportedFormats: List<String>
)

data class JDUploadResponse(
    @SerializedName("jd_text") val jdText: String
)

