package com.aashi.resumeiq.ui.detail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aashi.resumeiq.network.*
import com.aashi.resumeiq.repository.ResumeRepository
import com.aashi.resumeiq.ui.auth.UiState
import com.aashi.resumeiq.utils.toUserFriendlyMessage
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DetailViewModel @Inject constructor(
    private val resumeRepository: ResumeRepository
) : ViewModel() {

    private val _historyState = MutableStateFlow<UiState<List<ResumeListResponse>>>(UiState.Idle)
    val historyState: StateFlow<UiState<List<ResumeListResponse>>> = _historyState.asStateFlow()

    private val _uploadState = MutableStateFlow<UiState<ResumeResponse>>(UiState.Idle)
    val uploadState: StateFlow<UiState<ResumeResponse>> = _uploadState.asStateFlow()

    private val _uploadProgress = MutableStateFlow<Float>(0f)
    val uploadProgress: StateFlow<Float> = _uploadProgress.asStateFlow()

    private val _detailState = MutableStateFlow<UiState<ResumeResponse>>(UiState.Idle)
    val detailState: StateFlow<UiState<ResumeResponse>> = _detailState.asStateFlow()

    private val _atsState = MutableStateFlow<UiState<ATSAnalysisSchema>>(UiState.Idle)
    val atsState: StateFlow<UiState<ATSAnalysisSchema>> = _atsState.asStateFlow()

    private val _matchState = MutableStateFlow<UiState<JDMatchResponse>>(UiState.Idle)
    val matchState: StateFlow<UiState<JDMatchResponse>> = _matchState.asStateFlow()

    private val _simState = MutableStateFlow<UiState<RecruiterSimulationResponse>>(UiState.Idle)
    val simState: StateFlow<UiState<RecruiterSimulationResponse>> = _simState.asStateFlow()

    private val _coverLetterState = MutableStateFlow<UiState<CoverLetterVersionsResponse>>(UiState.Idle)
    val coverLetterState: StateFlow<UiState<CoverLetterVersionsResponse>> = _coverLetterState.asStateFlow()

    private val _jdUploadState = MutableStateFlow<UiState<JDUploadResponse>>(UiState.Idle)
    val jdUploadState: StateFlow<UiState<JDUploadResponse>> = _jdUploadState.asStateFlow()


    fun clearUploadState() {
        _uploadState.value = UiState.Idle
        _uploadProgress.value = 0f
    }

    fun clearMatchAndSimStates() {
        _matchState.value = UiState.Idle
        _simState.value = UiState.Idle
        _coverLetterState.value = UiState.Idle
        _jdUploadState.value = UiState.Idle
    }

    fun clearJdUploadState() {
        _jdUploadState.value = UiState.Idle
    }


    fun uploadResume(filename: String, bytes: ByteArray) {
        viewModelScope.launch {
            _uploadState.value = UiState.Loading
            _uploadProgress.value = 0f
            resumeRepository.uploadResume(filename, bytes) { progress ->
                _uploadProgress.value = progress
            }
                .onSuccess { _uploadState.value = UiState.Success(it) }
                .onFailure { _uploadState.value = UiState.Error(it.toUserFriendlyMessage()) }
        }
    }

    fun fetchHistory() {
        viewModelScope.launch {
            _historyState.value = UiState.Loading
            resumeRepository.getResumeHistory()
                .onSuccess { _historyState.value = UiState.Success(it) }
                .onFailure { _historyState.value = UiState.Error(it.message ?: "Failed to fetch histories") }
        }
    }

    fun fetchDetails(resumeId: Int) {
        viewModelScope.launch {
            _detailState.value = UiState.Loading
            resumeRepository.getResumeDetails(resumeId)
                .onSuccess { 
                    _detailState.value = UiState.Success(it)
                    it.atsAnalysis?.let { analysis ->
                        _atsState.value = UiState.Success(analysis)
                    }
                }
                .onFailure { _detailState.value = UiState.Error(it.message ?: "Failed to load details") }
        }
    }

    fun analyzeATS(resumeId: Int) {
        viewModelScope.launch {
            _atsState.value = UiState.Loading
            resumeRepository.analyzeResumeATS(resumeId)
                .onSuccess { _atsState.value = UiState.Success(it) }
                .onFailure { _atsState.value = UiState.Error(it.message ?: "ATS Audit failed") }
        }
    }

    fun deleteResume(resumeId: Int) {
        viewModelScope.launch {
            resumeRepository.deleteResume(resumeId)
            fetchHistory()
        }
    }

    fun deleteAllResumes() {
        viewModelScope.launch {
            resumeRepository.deleteAllResumes()
            fetchHistory()
        }
    }

    fun updateResumeDetails(resumeId: Int, data: ResumeParsedSchema) {
        viewModelScope.launch {
            _detailState.value = UiState.Loading
            resumeRepository.updateResumeDetails(resumeId, data)
                .onSuccess { 
                    _detailState.value = UiState.Success(it)
                    it.atsAnalysis?.let { analysis ->
                        _atsState.value = UiState.Success(analysis)
                    }
                }
                .onFailure { _detailState.value = UiState.Error(it.message ?: "Update failed") }
        }
    }

    fun matchWithJD(resumeId: Int, jdText: String) {
        viewModelScope.launch {
            _matchState.value = UiState.Loading
            resumeRepository.matchResume(resumeId, jdText)
                .onSuccess { _matchState.value = UiState.Success(it) }
                .onFailure { _matchState.value = UiState.Error(it.message ?: "JD Match calculation failed") }
        }
    }

    fun uploadJD(filename: String, bytes: ByteArray) {
        viewModelScope.launch {
            _jdUploadState.value = UiState.Loading
            resumeRepository.uploadJD(filename, bytes)
                .onSuccess { _jdUploadState.value = UiState.Success(it) }
                .onFailure { _jdUploadState.value = UiState.Error(it.message ?: "Failed to upload JD file") }
        }
    }


    fun simulateRecruiter(resumeId: Int, jdText: String) {
        viewModelScope.launch {
            _simState.value = UiState.Loading
            resumeRepository.simulateRecruiter(resumeId, jdText)
                .onSuccess { _simState.value = UiState.Success(it) }
                .onFailure { _simState.value = UiState.Error(it.message ?: "Screening simulation failed") }
        }
    }

    fun generateCoverLetter(resumeId: Int, jobTitle: String, companyName: String, industry: String?) {
        viewModelScope.launch {
            _coverLetterState.value = UiState.Loading
            resumeRepository.generateCoverLetter(resumeId, jobTitle, companyName, industry)
                .onSuccess { _coverLetterState.value = UiState.Success(it) }
                .onFailure { _coverLetterState.value = UiState.Error(it.message ?: "Cover Letter generation failed") }
        }
    }

    fun getEnhancements(resumeId: Int) {
        viewModelScope.launch {
            _atsState.value = UiState.Loading
            resumeRepository.getResumeEnhancements(resumeId)
                .onSuccess { _atsState.value = UiState.Success(it) }
                .onFailure { _atsState.value = UiState.Error(it.message ?: "Failed to generate suggestions") }
        }
    }

    fun generateInterviewPrep(resumeId: Int, jdText: String? = null) {
        viewModelScope.launch {
            _atsState.value = UiState.Loading
            resumeRepository.generateInterviewPrep(resumeId, jdText)
                .onSuccess { _atsState.value = UiState.Success(it) }
                .onFailure { _atsState.value = UiState.Error(it.message ?: "Failed to generate interview prep") }
        }
    }

    private val _prepDownloadState = MutableStateFlow<DownloadState>(DownloadState.Idle)
    val prepDownloadState: StateFlow<DownloadState> = _prepDownloadState.asStateFlow()

    fun downloadInterviewPrep(context: Context, resumeId: Int, exportType: String) {
        viewModelScope.launch {
            _prepDownloadState.value = DownloadState.Downloading
            resumeRepository.exportInterviewPrep(resumeId, exportType)
                .onSuccess { bytes ->
                    try {
                        val docLabel = if (exportType == "questions") "Practice_Questions" else "Study_Guide"
                        val filename = "ResumeIQ_${docLabel}_${resumeId}.pdf"
                        saveFileToDownloads(context, filename, bytes)
                        _prepDownloadState.value = DownloadState.Success("Successfully downloaded $filename")
                    } catch (e: Exception) {
                        _prepDownloadState.value = DownloadState.Error(e.message ?: "Failed to save file to downloads")
                    }
                }
                .onFailure {
                    _prepDownloadState.value = DownloadState.Error(it.message ?: "Failed to download PDF")
                }
        }
    }

    fun downloadResumeReport(context: Context, resumeId: Int) {
        viewModelScope.launch {
            _prepDownloadState.value = DownloadState.Downloading
            resumeRepository.exportResumeReportPdf(resumeId)
                .onSuccess { bytes ->
                    try {
                        val filename = "ResumeIQ_Report_${resumeId}.pdf"
                        saveFileToDownloads(context, filename, bytes)
                        _prepDownloadState.value = DownloadState.Success("Successfully downloaded $filename")
                    } catch (e: Exception) {
                        _prepDownloadState.value = DownloadState.Error(e.message ?: "Failed to save report to downloads")
                    }
                }
                .onFailure {
                    _prepDownloadState.value = DownloadState.Error(it.message ?: "Failed to download PDF report")
                }
        }
    }

    fun shareInterviewPrep(context: Context, resumeId: Int, exportType: String) {
        viewModelScope.launch {
            _prepDownloadState.value = DownloadState.Downloading
            resumeRepository.exportInterviewPrep(resumeId, exportType)
                .onSuccess { bytes ->
                    try {
                        val docLabel = if (exportType == "questions") "Practice_Questions" else "Study_Guide"
                        val cacheFile = File(context.cacheDir, "Share_Interview_${resumeId}_${docLabel}.pdf")
                        FileOutputStream(cacheFile).use { fos ->
                            fos.write(bytes)
                        }
                        
                        val uri = FileProvider.getUriForFile(
                            context,
                            "com.aashi.resumeiq.fileprovider",
                            cacheFile
                        )
                        
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "application/pdf"
                            putExtra(Intent.EXTRA_STREAM, uri)
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        }
                        
                        val chooser = Intent.createChooser(intent, "Share Interview Prep PDF")
                        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        context.startActivity(chooser)
                        
                        _prepDownloadState.value = DownloadState.Success("Ready to share PDF")
                    } catch (e: Exception) {
                        _prepDownloadState.value = DownloadState.Error(e.message ?: "Failed to share PDF file")
                    }
                }
                .onFailure {
                    _prepDownloadState.value = DownloadState.Error(it.message ?: "Failed to fetch PDF for sharing")
                }
        }
    }

    fun resetPrepDownloadState() {
        _prepDownloadState.value = DownloadState.Idle
    }

    fun downloadCoverLetter(context: Context, text: String, format: String, filename: String) {
        viewModelScope.launch {
            _prepDownloadState.value = DownloadState.Downloading
            resumeRepository.exportCoverLetter(text, format, filename)
                .onSuccess { bytes ->
                    try {
                        val ext = format.lowercase()
                        val actualFilename = if (filename.endsWith(".$ext", ignoreCase = true)) {
                            filename
                        } else {
                            "$filename.$ext"
                        }
                        saveFileToDownloads(context, actualFilename, bytes)
                        _prepDownloadState.value = DownloadState.Success("Successfully downloaded $actualFilename")
                    } catch (e: Exception) {
                        _prepDownloadState.value = DownloadState.Error(e.message ?: "Failed to save file to downloads")
                    }
                }
                .onFailure {
                    _prepDownloadState.value = DownloadState.Error(it.message ?: "Failed to export cover letter")
                }
        }
    }

    fun downloadResumeTemplate(context: Context, resumeId: Int, format: String, templateName: String = "Executive Slate") {
        viewModelScope.launch {
            _prepDownloadState.value = DownloadState.Downloading
            resumeRepository.exportResumeTemplate(resumeId, templateName, format, null)
                .onSuccess { bytes ->
                    try {
                        val ext = format.lowercase()
                        val cleanTmplName = templateName.replace("\\s+".toRegex(), "_")
                        val filename = "Generated_Resume_${resumeId}_${cleanTmplName}.$ext"
                        saveFileToDownloads(context, filename, bytes)
                        _prepDownloadState.value = DownloadState.Success("Successfully downloaded $filename")
                    } catch (e: Exception) {
                        _prepDownloadState.value = DownloadState.Error(e.message ?: "Failed to save template to downloads")
                    }
                }
                .onFailure {
                    _prepDownloadState.value = DownloadState.Error(it.message ?: "Failed to export resume template")
                }
        }
    }

    private val _latestMatches = MutableStateFlow<Map<Int, Int?>>(emptyMap())
    val latestMatches: StateFlow<Map<Int, Int?>> = _latestMatches.asStateFlow()

    fun fetchLatestMatchesForHistory(resumes: List<ResumeListResponse>) {
        viewModelScope.launch {
            val currentMap = _latestMatches.value.toMutableMap()
            resumes.forEach { resume ->
                if (!currentMap.containsKey(resume.id)) {
                    resumeRepository.getResumeMatches(resume.id)
                        .onSuccess { matches ->
                            val latestScore = matches.maxByOrNull { it.id }?.matchScore
                            currentMap[resume.id] = latestScore
                            _latestMatches.value = currentMap.toMap()
                        }
                }
            }
        }
    }

    private fun saveFileToDownloads(context: Context, filename: String, bytes: ByteArray) {
        val resolver = context.contentResolver
        val mimeType = if (filename.endsWith(".docx", ignoreCase = true)) {
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        } else {
            "application/pdf"
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val contentValues = android.content.ContentValues().apply {
                put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(android.provider.MediaStore.MediaColumns.MIME_TYPE, mimeType)
                put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }
            val uri = resolver.insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                ?: throw IOException("Failed to create MediaStore entry for Downloads")
            resolver.openOutputStream(uri)?.use { outputStream ->
                outputStream.write(bytes)
            } ?: throw IOException("Failed to open MediaStore output stream")
        } else {
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val file = File(downloadsDir, filename)
            FileOutputStream(file).use { outputStream ->
                outputStream.write(bytes)
            }
        }
    }
}

sealed class DownloadState {
    object Idle : DownloadState()
    object Downloading : DownloadState()
    data class Success(val message: String) : DownloadState()
    data class Error(val message: String) : DownloadState()
}
