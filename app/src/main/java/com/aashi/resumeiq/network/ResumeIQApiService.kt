package com.aashi.resumeiq.network

import okhttp3.MultipartBody
import retrofit2.http.*

interface ResumeIQApiService {

    // --- User / Auth Endpoints ---

    @POST("users")
    suspend fun registerUser(
        @Body request: UserCreate
    ): UserResponse

    @POST("users/login")
    suspend fun loginUser(
        @Body request: UserLogin
    ): LoginResponse

    @POST("users/logout")
    suspend fun logoutUser(): MessageResponse

    @POST("users/verify-email")
    suspend fun verifyEmail(
        @Body request: UserVerify
    ): MessageResponse

    @POST("users/resend-verification")
    suspend fun resendVerification(
        @Body request: ForgotPasswordRequest
    ): MessageResponse

    @POST("users/forgot-password")
    suspend fun forgotPassword(
        @Body request: ForgotPasswordRequest
    ): MessageResponse

    @POST("users/reset-password")
    suspend fun resetPassword(
        @Body request: ResetPasswordRequest
    ): MessageResponse

    @GET("users/me")
    suspend fun getMe(): UserResponse

    @PUT("users/me")
    suspend fun updateProfile(
        @Body request: UserUpdate
    ): UserResponse

    @PUT("users/me/password")
    suspend fun changePassword(
        @Body request: PasswordChange
    ): MessageResponse

    @GET("users/dashboard/stats")
    suspend fun getDashboardStats(): DashboardStatsResponse


    // --- Resume Management Endpoints ---

    @Multipart
    @POST("resumes/upload")
    suspend fun uploadResume(
        @Part file: MultipartBody.Part
    ): ResumeResponse

    @GET("resumes")
    suspend fun getResumeHistory(
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 10
    ): List<ResumeListResponse>

    @GET("resumes/{id}")
    suspend fun getResumeDetails(
        @Path("id") id: Int
    ): ResumeResponse

    @POST("resumes/{id}/analyze")
    suspend fun analyzeResumeATS(
        @Path("id") id: Int
    ): ATSAnalysisSchema

    @DELETE("resumes/{id}")
    suspend fun deleteResume(
        @Path("id") id: Int
    ): MessageResponse

    @DELETE("resumes")
    suspend fun deleteAllResumes(): MessageResponse

    @PUT("resumes/{id}")
    suspend fun updateResumeDetails(
        @Path("id") id: Int,
        @Body request: ResumeParsedSchema
    ): ResumeResponse


    // --- Advanced AI Features ---

    @GET("resumes/{id}/enhancements")
    suspend fun getResumeEnhancements(
        @Path("id") id: Int
    ): ATSAnalysisSchema

    @POST("resumes/{id}/interview-prep")
    suspend fun generateInterviewPrep(
        @Path("id") id: Int,
        @Body request: JDMatchRequest? = null
    ): ATSAnalysisSchema


    // --- Job Description Matching & Screening ---

    @Multipart
    @POST("resumes/jd/upload")
    suspend fun uploadJD(
        @Part file: MultipartBody.Part
    ): JDUploadResponse

    @POST("resumes/{id}/match")
    suspend fun matchResume(
        @Path("id") id: Int,
        @Body request: JDMatchRequest
    ): JDMatchResponse

    @GET("resumes/{id}/matches")
    suspend fun getResumeMatches(
        @Path("id") id: Int
    ): List<JDMatchResponse>

    @POST("resumes/{id}/simulate-recruiter")
    suspend fun simulateRecruiter(
        @Path("id") id: Int,
        @Body request: RecruiterSimulationRequest
    ): RecruiterSimulationResponse

    @GET("resumes/{id}/simulations")
    suspend fun getResumeSimulations(
        @Path("id") id: Int
    ): List<RecruiterSimulationResponse>

    @POST("resumes/{id}/cover-letter")
    suspend fun generateCoverLetter(
        @Path("id") id: Int,
        @Body request: CoverLetterRequest
    ): CoverLetterVersionsResponse

    @GET("resumes/templates")
    suspend fun getAvailableTemplates(): List<TemplateItemResponse>

    @POST("resumes/{id}/export-template")
    @Streaming
    suspend fun exportResumeTemplate(
        @Path("id") id: Int,
        @Body request: ResumeExportRequest
    ): okhttp3.ResponseBody

    @GET("resumes/{id}/export-interview")
    @Streaming
    suspend fun exportInterviewPrep(
        @Path("id") id: Int,
        @Query("export_type") exportType: String
    ): okhttp3.ResponseBody

    @POST("resumes/cover-letter/export")
    @Streaming
    suspend fun exportCoverLetter(
        @Body request: CoverLetterExportRequest
    ): okhttp3.ResponseBody

    @GET("resumes/{id}/export-pdf")
    @Streaming
    suspend fun exportResumeReportPdf(
        @Path("id") id: Int
    ): okhttp3.ResponseBody
}
