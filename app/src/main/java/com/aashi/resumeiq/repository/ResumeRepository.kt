package com.aashi.resumeiq.repository

import com.aashi.resumeiq.network.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class ResumeRepository(
    private val apiService: ResumeIQApiService
) {

    suspend fun uploadResume(
        filename: String,
        fileBytes: ByteArray,
        onProgress: (progress: Float) -> Unit
    ): Result<ResumeResponse> {
        return try {
            val mediaType = if (filename.endsWith(".docx", ignoreCase = true)) {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            } else {
                "application/pdf"
            }
            val requestFile = fileBytes.toRequestBody(mediaType.toMediaTypeOrNull())
            val progressRequestBody = ProgressRequestBody(requestFile) { bytesWritten, contentLength ->
                val progress = if (contentLength > 0) bytesWritten.toFloat() / contentLength else 0f
                onProgress(progress)
            }
            val filePart = MultipartBody.Part.createFormData("file", filename, progressRequestBody)
            
            val response = apiService.uploadResume(filePart)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun uploadJD(
        filename: String,
        fileBytes: ByteArray
    ): Result<JDUploadResponse> {
        return try {
            val mediaType = when {
                filename.endsWith(".docx", ignoreCase = true) -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                filename.endsWith(".pdf", ignoreCase = true) -> "application/pdf"
                else -> "text/plain"
            }
            val requestFile = fileBytes.toRequestBody(mediaType.toMediaTypeOrNull())
            val filePart = MultipartBody.Part.createFormData("file", filename, requestFile)
            val response = apiService.uploadJD(filePart)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getResumeHistory(skip: Int = 0, limit: Int = 20): Result<List<ResumeListResponse>> {
        return try {
            val response = apiService.getResumeHistory(skip, limit)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getResumeDetails(id: Int): Result<ResumeResponse> {
        return try {
            val response = apiService.getResumeDetails(id)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteResume(id: Int): Result<MessageResponse> {
        return try {
            val response = apiService.deleteResume(id)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteAllResumes(): Result<MessageResponse> {
        return try {
            val response = apiService.deleteAllResumes()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateResumeDetails(id: Int, data: ResumeParsedSchema): Result<ResumeResponse> {
        return try {
            val response = apiService.updateResumeDetails(id, data)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun analyzeResumeATS(id: Int): Result<ATSAnalysisSchema> {
        return try {
            val response = apiService.analyzeResumeATS(id)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getResumeEnhancements(id: Int): Result<ATSAnalysisSchema> {
        return try {
            val response = apiService.getResumeEnhancements(id)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun generateInterviewPrep(id: Int, jdText: String? = null, jobRole: String? = null): Result<ATSAnalysisSchema> {
        return try {
            val request = if (jdText != null || jobRole != null) JDMatchRequest(jdText, jobRole) else null
            val response = apiService.generateInterviewPrep(id, request)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun toggleInterviewQuestionStatus(id: Int, category: String, questionIdx: Int, statusType: String): Result<ATSAnalysisSchema> {
        return try {
            val request = ToggleStatusRequest(category, questionIdx, statusType)
            val response = apiService.toggleInterviewQuestionStatus(id, request)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun matchResume(id: Int, jdText: String): Result<JDMatchResponse> {
        return try {
            val response = apiService.matchResume(id, JDMatchRequest(jdText))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getResumeMatches(id: Int): Result<List<JDMatchResponse>> {
        return try {
            val response = apiService.getResumeMatches(id)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun simulateRecruiter(id: Int, jdText: String): Result<RecruiterSimulationResponse> {
        return try {
            val response = apiService.simulateRecruiter(id, RecruiterSimulationRequest(jdText))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getResumeSimulations(id: Int): Result<List<RecruiterSimulationResponse>> {
        return try {
            val response = apiService.getResumeSimulations(id)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun generateCoverLetter(
        id: Int,
        jobTitle: String,
        companyName: String,
        industry: String?
    ): Result<CoverLetterVersionsResponse> {
        return try {
            val response = apiService.generateCoverLetter(
                id,
                CoverLetterRequest(jobTitle, companyName, industry)
            )
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAvailableTemplates(): Result<List<TemplateItemResponse>> {
        return try {
            val response = apiService.getAvailableTemplates()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun exportResumeTemplate(
        id: Int,
        templateName: String,
        format: String,
        resumeData: ResumeParsedSchema?
    ): Result<ByteArray> {
        return try {
            val response = apiService.exportResumeTemplate(
                id,
                ResumeExportRequest(templateName, format, resumeData)
            )
            val bytes = response.bytes()
            Result.success(bytes)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun exportInterviewPrep(
        id: Int,
        exportType: String
    ): Result<ByteArray> {
        return try {
            val response = apiService.exportInterviewPrep(id, exportType)
            val bytes = response.bytes()
            Result.success(bytes)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun exportCoverLetter(
        text: String,
        format: String,
        filename: String? = null
    ): Result<ByteArray> {
        return try {
            val response = apiService.exportCoverLetter(CoverLetterExportRequest(text, format, filename))
            val bytes = response.bytes()
            Result.success(bytes)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun exportResumeReportPdf(id: Int): Result<ByteArray> {
        return try {
            val response = apiService.exportResumeReportPdf(id)
            val bytes = response.bytes()
            Result.success(bytes)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun restoreResumes(list: List<ResumeRestoreSchema>): Result<MessageResponse> {
        return try {
            val response = apiService.restoreResumes(list)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
