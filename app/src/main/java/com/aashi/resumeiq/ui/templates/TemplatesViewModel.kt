package com.aashi.resumeiq.ui.templates

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import androidx.core.content.FileProvider
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aashi.resumeiq.network.TemplateItemResponse
import com.aashi.resumeiq.repository.ResumeRepository
import com.aashi.resumeiq.ui.auth.UiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import javax.inject.Inject

sealed class TemplateDownloadStatus {
    object Idle : TemplateDownloadStatus()
    object Downloading : TemplateDownloadStatus()
    object Success : TemplateDownloadStatus()
    data class Error(val message: String) : TemplateDownloadStatus()
}

@HiltViewModel
class TemplatesViewModel @Inject constructor(
    private val resumeRepository: ResumeRepository
) : ViewModel() {

    private val _templatesState = MutableStateFlow<UiState<List<TemplateItemResponse>>>(UiState.Idle)
    val templatesState: StateFlow<UiState<List<TemplateItemResponse>>> = _templatesState.asStateFlow()

    private val _previewState = MutableStateFlow<UiState<File>>(UiState.Idle)
    val previewState: StateFlow<UiState<File>> = _previewState.asStateFlow()

    private val _selectedTemplate = MutableStateFlow<TemplateItemResponse?>(null)
    val selectedTemplate: StateFlow<TemplateItemResponse?> = _selectedTemplate.asStateFlow()

    private val _downloadStatus = MutableStateFlow<TemplateDownloadStatus>(TemplateDownloadStatus.Idle)
    val downloadStatus: StateFlow<TemplateDownloadStatus> = _downloadStatus.asStateFlow()

    fun loadTemplates(resumeId: Int, context: Context) {
        viewModelScope.launch {
            _templatesState.value = UiState.Loading
            resumeRepository.getAvailableTemplates()
                .onSuccess { list ->
                    _templatesState.value = UiState.Success(list)
                    if (list.isNotEmpty()) {
                        val defaultTmpl = list.first()
                        _selectedTemplate.value = defaultTmpl
                        loadPreview(resumeId, defaultTmpl.name, context)
                    }
                }
                .onFailure {
                    _templatesState.value = UiState.Error(it.message ?: "Failed to load templates list")
                }
        }
    }

    fun selectTemplate(resumeId: Int, template: TemplateItemResponse, context: Context) {
        _selectedTemplate.value = template
        loadPreview(resumeId, template.name, context)
    }

    fun loadPreview(resumeId: Int, templateName: String, context: Context) {
        viewModelScope.launch {
            _previewState.value = UiState.Loading
            resumeRepository.exportResumeTemplate(resumeId, templateName, "pdf", null)
                .onSuccess { bytes ->
                    try {
                        val cacheFile = File(context.cacheDir, "preview_resume_${resumeId}.pdf")
                        FileOutputStream(cacheFile).use { fos ->
                            fos.write(bytes)
                        }
                        _previewState.value = UiState.Success(cacheFile)
                    } catch (e: Exception) {
                        _previewState.value = UiState.Error(e.message ?: "Failed to save preview file")
                    }
                }
                .onFailure {
                    _previewState.value = UiState.Error(it.message ?: "Failed to fetch PDF preview")
                }
        }
    }

    fun downloadPdf(context: Context, resumeId: Int, templateName: String) {
        viewModelScope.launch {
            _downloadStatus.value = TemplateDownloadStatus.Downloading
            resumeRepository.exportResumeTemplate(resumeId, templateName, "pdf", null)
                .onSuccess { bytes ->
                    try {
                        val cleanTmplName = templateName.replace("\\s+".toRegex(), "_")
                        val filename = "Generated_Resume_${resumeId}_${cleanTmplName}.pdf"
                        saveFileToDownloads(context, filename, bytes)
                        _downloadStatus.value = TemplateDownloadStatus.Success
                    } catch (e: Exception) {
                        _downloadStatus.value = TemplateDownloadStatus.Error(e.message ?: "Failed to save file to downloads")
                    }
                }
                .onFailure {
                    _downloadStatus.value = TemplateDownloadStatus.Error(it.message ?: "Failed to download PDF template")
                }
        }
    }

    fun sharePdf(context: Context, resumeId: Int, templateName: String) {
        viewModelScope.launch {
            _downloadStatus.value = TemplateDownloadStatus.Downloading
            resumeRepository.exportResumeTemplate(resumeId, templateName, "pdf", null)
                .onSuccess { bytes ->
                    try {
                        val cleanTmplName = templateName.replace("\\s+".toRegex(), "_")
                        val cacheFile = File(context.cacheDir, "Share_Resume_${resumeId}_${cleanTmplName}.pdf")
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
                        
                        val chooser = Intent.createChooser(intent, "Share Generated PDF")
                        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        context.startActivity(chooser)
                        
                        _downloadStatus.value = TemplateDownloadStatus.Success
                    } catch (e: Exception) {
                        _downloadStatus.value = TemplateDownloadStatus.Error(e.message ?: "Failed to share PDF file")
                    }
                }
                .onFailure {
                    _downloadStatus.value = TemplateDownloadStatus.Error(it.message ?: "Failed to fetch PDF for sharing")
                }
        }
    }

    fun resetDownloadStatus() {
        _downloadStatus.value = TemplateDownloadStatus.Idle
    }

    private fun saveFileToDownloads(context: Context, filename: String, bytes: ByteArray) {
        val resolver = context.contentResolver
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val contentValues = android.content.ContentValues().apply {
                put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(android.provider.MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
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
