package com.aashi.resumeiq.ui.builder

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aashi.resumeiq.network.*
import com.aashi.resumeiq.repository.ResumeRepository
import com.aashi.resumeiq.ui.auth.UiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class SaveStatus {
    object Idle : SaveStatus()
    object Saving : SaveStatus()
    object Saved : SaveStatus()
    object ValidationError : SaveStatus()
    data class Error(val message: String) : SaveStatus()
}

sealed class DownloadStatus {
    object Idle : DownloadStatus()
    object Downloading : DownloadStatus()
    object Success : DownloadStatus()
    data class Error(val message: String) : DownloadStatus()
}

@HiltViewModel
class BuilderViewModel @Inject constructor(
    private val resumeRepository: ResumeRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState<ResumeResponse>>(UiState.Idle)
    val uiState: StateFlow<UiState<ResumeResponse>> = _uiState.asStateFlow()

    private val _saveStatus = MutableStateFlow<SaveStatus>(SaveStatus.Idle)
    val saveStatus: StateFlow<SaveStatus> = _saveStatus.asStateFlow()

    private val _downloadStatus = MutableStateFlow<DownloadStatus>(DownloadStatus.Idle)
    val downloadStatus: StateFlow<DownloadStatus> = _downloadStatus.asStateFlow()

    // Form fields state
    var resumeId = MutableStateFlow<Int>(-1)
    var name = MutableStateFlow("")
    var email = MutableStateFlow("")
    var phone = MutableStateFlow("")
    var skills = MutableStateFlow<List<String>>(emptyList())
    var education = MutableStateFlow<List<EducationSchema>>(emptyList())
    var experience = MutableStateFlow<List<ExperienceSchema>>(emptyList())
    var projects = MutableStateFlow<List<ProjectSchema>>(emptyList())
    var certifications = MutableStateFlow<List<CertificationSchema>>(emptyList())
    var languages = MutableStateFlow<List<LanguageSchema>>(emptyList())

    // Validation fields
    var nameError = MutableStateFlow<String?>(null)
    var emailError = MutableStateFlow<String?>(null)
    var phoneError = MutableStateFlow<String?>(null)

    private val emailRegex = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")
    private var autosaveJob: Job? = null

    fun initBuilder(id: Int) {
        if (id == -1) {
            initializeNewResume()
        } else {
            loadExistingResume(id)
        }
    }

    private fun initializeNewResume() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val dummyBytes = createDummyPdf()
                resumeRepository.uploadResume("built_resume.pdf", dummyBytes) { }
                    .onSuccess { response ->
                        resumeId.value = response.id
                        // Default initial form
                        name.value = response.name ?: ""
                        email.value = response.email ?: ""
                        phone.value = response.phone ?: ""
                        skills.value = response.skills
                        education.value = response.education
                        experience.value = response.experience
                        projects.value = response.projects
                        certifications.value = response.certifications
                        languages.value = response.languages
                        _uiState.value = UiState.Success(response)
                    }
                    .onFailure {
                        _uiState.value = UiState.Error(it.message ?: "Failed to initialize blank resume")
                    }
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Initialization error")
            }
        }
    }

    private fun loadExistingResume(id: Int) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            resumeRepository.getResumeDetails(id)
                .onSuccess { response ->
                    resumeId.value = response.id
                    name.value = response.name ?: ""
                    email.value = response.email ?: ""
                    phone.value = response.phone ?: ""
                    skills.value = response.skills
                    education.value = response.education
                    experience.value = response.experience
                    projects.value = response.projects
                    certifications.value = response.certifications
                    languages.value = response.languages
                    _uiState.value = UiState.Success(response)
                }
                .onFailure {
                    _uiState.value = UiState.Error(it.message ?: "Failed to load resume details")
                }
        }
    }

    fun onFieldChanged() {
        val isValid = validateFields()
        if (isValid) {
            _saveStatus.value = SaveStatus.Saving
            autosaveJob?.cancel()
            autosaveJob = viewModelScope.launch {
                delay(1500)
                performSave()
            }
        } else {
            _saveStatus.value = SaveStatus.ValidationError
        }
    }

    private fun validateFields(): Boolean {
        var valid = true

        if (name.value.isBlank()) {
            nameError.value = "Name cannot be empty"
            valid = false
        } else {
            nameError.value = null
        }

        if (email.value.isBlank()) {
            emailError.value = "Email cannot be empty"
            valid = false
        } else if (!emailRegex.matches(email.value.trim())) {
            emailError.value = "Invalid email format"
            valid = false
        } else {
            emailError.value = null
        }

        if (phone.value.isBlank()) {
            phoneError.value = "Phone cannot be empty"
            valid = false
        } else {
            phoneError.value = null
        }

        return valid
    }

    private suspend fun performSave() {
        val currentId = resumeId.value
        if (currentId == -1) return

        val request = ResumeParsedSchema(
            name = name.value.trim(),
            email = email.value.trim(),
            phone = phone.value.trim(),
            skills = skills.value,
            education = education.value,
            experience = experience.value,
            projects = projects.value,
            certifications = certifications.value,
            languages = languages.value
        )

        resumeRepository.updateResumeDetails(currentId, request)
            .onSuccess {
                _saveStatus.value = SaveStatus.Saved
            }
            .onFailure {
                _saveStatus.value = SaveStatus.Error(it.message ?: "Failed to autosave changes")
            }
    }

    fun downloadPdf(context: Context, templateName: String) {
        val currentId = resumeId.value
        if (currentId == -1) return

        viewModelScope.launch {
            _downloadStatus.value = DownloadStatus.Downloading
            val resumeData = ResumeParsedSchema(
                name = name.value.trim(),
                email = email.value.trim(),
                phone = phone.value.trim(),
                skills = skills.value,
                education = education.value,
                experience = experience.value,
                projects = projects.value,
                certifications = certifications.value,
                languages = languages.value
            )
            resumeRepository.exportResumeTemplate(currentId, templateName, "pdf", resumeData)
                .onSuccess { bytes ->
                    try {
                        val cleanName = (name.value.ifBlank { "Candidate" }).replace("\\s+".toRegex(), "_")
                        val filename = "Resume_${cleanName}_${templateName.replace("\\s+".toRegex(), "_")}.pdf"
                        saveFileToDownloads(context, filename, bytes)
                        _downloadStatus.value = DownloadStatus.Success
                    } catch (e: Exception) {
                        _downloadStatus.value = DownloadStatus.Error(e.message ?: "Failed to save file")
                    }
                }
                .onFailure {
                    _downloadStatus.value = DownloadStatus.Error(it.message ?: "Export API failed")
                }
        }
    }

    fun resetDownloadStatus() {
        _downloadStatus.value = DownloadStatus.Idle
    }

    private fun saveFileToDownloads(context: Context, filename: String, bytes: ByteArray) {
        val resolver = context.contentResolver
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            val contentValues = android.content.ContentValues().apply {
                put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(android.provider.MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, android.os.Environment.DIRECTORY_DOWNLOADS)
            }
            val uri = resolver.insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                ?: throw java.io.IOException("Failed to create MediaStore entry for Downloads")
            resolver.openOutputStream(uri)?.use { outputStream ->
                outputStream.write(bytes)
            } ?: throw java.io.IOException("Failed to open MediaStore output stream")
        } else {
            val downloadsDir = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS)
            val file = java.io.File(downloadsDir, filename)
            java.io.FileOutputStream(file).use { outputStream ->
                outputStream.write(bytes)
            }
        }
    }

    private fun createDummyPdf(): ByteArray {
        val pdfDocument = android.graphics.pdf.PdfDocument()
        val pageInfo = android.graphics.pdf.PdfDocument.PageInfo.Builder(300, 400, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas = page.canvas
        val paint = android.graphics.Paint()
        paint.textSize = 12f
        canvas.drawText("Resume Builder Draft", 20f, 40f, paint)
        canvas.drawText("Name: Draft Candidate", 20f, 60f, paint)
        pdfDocument.finishPage(page)
        val outputStream = java.io.ByteArrayOutputStream()
        pdfDocument.writeTo(outputStream)
        pdfDocument.close()
        return outputStream.toByteArray()
    }
}
