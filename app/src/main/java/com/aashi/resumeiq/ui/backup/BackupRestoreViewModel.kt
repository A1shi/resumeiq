package com.aashi.resumeiq.ui.backup

import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aashi.resumeiq.data.PreferencesManager
import com.aashi.resumeiq.network.ResumeRestoreSchema
import com.aashi.resumeiq.repository.ResumeRepository
import com.aashi.resumeiq.utils.toUserFriendlyMessage
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

data class BackupSettings(
    val darkModeEnabled: Boolean?,
    val disclaimerAccepted: Boolean,
    val pickerExplanationShown: Boolean,
    val onboardingCompleted: Boolean,
    val dashboardTourCompleted: Boolean,
    val builderTourCompleted: Boolean,
    val detailTourCompleted: Boolean,
    val interviewTourCompleted: Boolean
)

data class BackupPayload(
    val version: Int,
    val backupDate: String,
    val settings: BackupSettings,
    val resumes: List<ResumeRestoreSchema>
)

sealed class BackupRestoreState {
    object Idle : BackupRestoreState()
    object Loading : BackupRestoreState()
    data class Parsed(val payload: BackupPayload, val fileSizeStr: String) : BackupRestoreState()
    object Success : BackupRestoreState()
    data class Error(val message: String) : BackupRestoreState()
}

@HiltViewModel
class BackupRestoreViewModel @Inject constructor(
    private val resumeRepository: ResumeRepository,
    private val preferencesManager: PreferencesManager
) : ViewModel() {

    private val _state = MutableStateFlow<BackupRestoreState>(BackupRestoreState.Idle)
    val state: StateFlow<BackupRestoreState> = _state.asStateFlow()

    private val gson = Gson()

    fun exportBackup(context: Context) {
        viewModelScope.launch {
            _state.value = BackupRestoreState.Loading
            try {
                // 1. Fetch all local settings
                val settings = BackupSettings(
                    darkModeEnabled = preferencesManager.darkModeEnabled.first(),
                    disclaimerAccepted = preferencesManager.disclaimerAccepted.first(),
                    pickerExplanationShown = preferencesManager.pickerExplanationShown.first(),
                    onboardingCompleted = preferencesManager.onboardingCompleted.first(),
                    dashboardTourCompleted = preferencesManager.dashboardTourCompleted.first(),
                    builderTourCompleted = preferencesManager.builderTourCompleted.first(),
                    detailTourCompleted = preferencesManager.detailTourCompleted.first(),
                    interviewTourCompleted = preferencesManager.interviewTourCompleted.first()
                )

                // 2. Fetch all resumes from repository
                val historyResult = resumeRepository.getResumeHistory(limit = 1000)
                val resumeList = historyResult.getOrThrow()

                // Fetch details for each resume to get parsed structures, cover letters, and interview prep
                val fullResumes = resumeList.map { item ->
                    val detailResult = resumeRepository.getResumeDetails(item.id)
                    val detail = detailResult.getOrThrow()
                    
                    // Convert ResumeResponse to ResumeRestoreSchema
                    ResumeRestoreSchema(
                        filename = detail.filename,
                        name = detail.name,
                        email = detail.email,
                        phone = detail.phone,
                        summary = detail.summary,
                        skills = detail.skills,
                        education = detail.education,
                        experience = detail.experience,
                        projects = detail.projects,
                        certifications = detail.certifications,
                        languages = detail.languages,
                        leadership = detail.leadership,
                        interests = detail.interests,
                        referees = detail.referees,
                        customization = detail.customization,
                        achievements = detail.achievements ?: emptyList(),
                        sectionOrder = detail.sectionOrder ?: emptyList(),
                        atsScore = detail.atsScore,
                        atsAnalysis = detail.atsAnalysis,
                        profession = detail.profession,
                        industry = detail.industry,
                        seniority = detail.seniority,
                        experienceLevel = detail.experienceLevel,
                        careerObjective = detail.careerObjective
                    )
                }

                // 3. Create Backup Payload
                val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                val backupDate = dateFormat.format(Date())
                val payload = BackupPayload(
                    version = 1,
                    backupDate = backupDate,
                    settings = settings,
                    resumes = fullResumes
                )

                // 4. Serialize and save to Downloads
                val jsonString = gson.toJson(payload)
                val filename = "resumeiq_backup_${System.currentTimeMillis()}.json"
                saveJsonToDownloads(context, filename, jsonString.toByteArray(Charsets.UTF_8))

                _state.value = BackupRestoreState.Success
            } catch (e: Exception) {
                _state.value = BackupRestoreState.Error(e.toUserFriendlyMessage())
            }
        }
    }

    fun selectBackupFile(context: Context, uri: Uri) {
        viewModelScope.launch {
            _state.value = BackupRestoreState.Loading
            try {
                val contentResolver = context.contentResolver
                val inputStream = contentResolver.openInputStream(uri)
                    ?: throw IOException("Failed to open backup file input stream")
                
                val bytes = inputStream.use { it.readBytes() }
                val jsonString = String(bytes, Charsets.UTF_8)
                
                val payload = gson.fromJson(jsonString, BackupPayload::class.java)
                if (payload == null || payload.resumes == null) {
                    throw IllegalArgumentException("Invalid backup file: Missing resumes list.")
                }

                val sizeInKb = bytes.size / 1024.0
                val fileSizeStr = String.format(Locale.getDefault(), "%.2f KB", sizeInKb)

                _state.value = BackupRestoreState.Parsed(payload, fileSizeStr)
            } catch (e: Exception) {
                _state.value = BackupRestoreState.Error(e.message ?: "Failed to parse backup file")
            }
        }
    }

    fun restoreBackup(payload: BackupPayload) {
        viewModelScope.launch {
            _state.value = BackupRestoreState.Loading
            try {
                // 1. Call backend restore API to clear and populate resumes
                val result = resumeRepository.restoreResumes(payload.resumes)
                result.getOrThrow()

                // 2. Restore client preferences local settings
                val settings = payload.settings
                preferencesManager.setDarkMode(settings.darkModeEnabled ?: false)
                preferencesManager.setDisclaimerAccepted(settings.disclaimerAccepted)
                preferencesManager.setPickerExplanationShown(settings.pickerExplanationShown)
                preferencesManager.setOnboardingCompleted(settings.onboardingCompleted)
                preferencesManager.setDashboardTourCompleted(settings.dashboardTourCompleted)
                preferencesManager.setBuilderTourCompleted(settings.builderTourCompleted)
                preferencesManager.setDetailTourCompleted(settings.detailTourCompleted)
                preferencesManager.setInterviewTourCompleted(settings.interviewTourCompleted)

                _state.value = BackupRestoreState.Success
            } catch (e: Exception) {
                _state.value = BackupRestoreState.Error(e.toUserFriendlyMessage())
            }
        }
    }

    fun resetState() {
        _state.value = BackupRestoreState.Idle
    }

    private fun saveJsonToDownloads(context: Context, filename: String, bytes: ByteArray) {
        val resolver = context.contentResolver
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val contentValues = android.content.ContentValues().apply {
                put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(android.provider.MediaStore.MediaColumns.MIME_TYPE, "application/json")
                put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }
            val uri = resolver.insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                ?: throw IOException("Failed to create MediaStore entry in Downloads")
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
