package com.aashi.resumeiq.ui.coverletter

import com.aashi.resumeiq.ui.theme.getOutlinedTextFieldColors

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aashi.resumeiq.network.CoverLetterVersionsResponse
import com.aashi.resumeiq.ui.auth.UiState
import com.aashi.resumeiq.ui.detail.DetailViewModel
import com.aashi.resumeiq.ui.detail.DownloadState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CoverLetterScreen(
    resumeId: Int,
    viewModel: DetailViewModel,
    onNavigateBack: () -> Unit
) {
    var jobTitle by rememberSaveable { mutableStateOf("") }
    var companyName by rememberSaveable { mutableStateOf("") }
    var industry by rememberSaveable { mutableStateOf("") }
    val coverLetterState by viewModel.coverLetterState.collectAsState()
    val downloadState by viewModel.prepDownloadState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(resumeId) {
        viewModel.clearMatchAndSimStates()
    }

    LaunchedEffect(downloadState) {
        when (downloadState) {
            is DownloadState.Success -> {
                Toast.makeText(context, (downloadState as DownloadState.Success).message, Toast.LENGTH_SHORT).show()
                viewModel.resetPrepDownloadState()
            }
            is DownloadState.Error -> {
                Toast.makeText(context, (downloadState as DownloadState.Error).message, Toast.LENGTH_LONG).show()
                viewModel.resetPrepDownloadState()
            }
            else -> {}
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Generate Cover Letter", color = MaterialTheme.colorScheme.onSurface) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.onSurface)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            when (val state = coverLetterState) {
                is UiState.Idle -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Provide targeted job information to build customized cover letter versions.",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            fontSize = 14.sp
                        )

                        OutlinedTextField(
                            value = jobTitle,
                            onValueChange = { jobTitle = it },
                            label = { Text("Target Job Title*") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = getOutlinedTextFieldColors()
                        )

                        OutlinedTextField(
                            value = companyName,
                            onValueChange = { companyName = it },
                            label = { Text("Company Name*") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = getOutlinedTextFieldColors()
                        )

                        OutlinedTextField(
                            value = industry,
                            onValueChange = { industry = it },
                            label = { Text("Industry (optional)") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = getOutlinedTextFieldColors()
                        )

                        Spacer(modifier = Modifier.weight(1f))

                        Button(
                            onClick = {
                                if (jobTitle.isNotBlank() && companyName.isNotBlank()) {
                                    viewModel.generateCoverLetter(
                                        resumeId = resumeId,
                                        jobTitle = jobTitle.trim(),
                                        companyName = companyName.trim(),
                                        industry = industry.trim().ifBlank { null }
                                    )
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            shape = RoundedCornerShape(12.dp),
                            enabled = jobTitle.isNotBlank() && companyName.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary
                            )
                        ) {
                            Text("Generate Versions", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                is UiState.Loading -> {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                is UiState.Success -> {
                    CoverLetterResultView(
                        versions = state.data,
                        onDownloadCoverLetter = { text, format ->
                            val cleanJob = jobTitle.replace("\\s+".toRegex(), "_")
                            val cleanCompany = companyName.replace("\\s+".toRegex(), "_")
                            val filename = "Cover_Letter_${cleanJob}_${cleanCompany}"
                            viewModel.downloadCoverLetter(context, text, format, filename)
                        }
                    )
                }
                is UiState.Error -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = state.message, color = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { viewModel.clearMatchAndSimStates() },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text("Try Again", color = MaterialTheme.colorScheme.onPrimary)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CoverLetterResultView(
    versions: CoverLetterVersionsResponse,
    onDownloadCoverLetter: (String, String) -> Unit
) {
    var selectedTab by rememberSaveable { mutableStateOf(0) }
    val context = LocalContext.current

    val letterText = when (selectedTab) {
        0 -> versions.professional
        1 -> versions.entryLevel
        else -> versions.experienced
    }

    Column(modifier = Modifier.fillMaxSize()) {
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.primary,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                    color = MaterialTheme.colorScheme.primary
                )
            }
        ) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text("Professional", color = if (selectedTab == 0) MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.6f)) }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text("Entry-Level", color = if (selectedTab == 1) MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.6f)) }
            )
            Tab(
                selected = selectedTab == 2,
                onClick = { selectedTab = 2 },
                text = { Text("Experienced", color = if (selectedTab == 2) MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.6f)) }
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = letterText,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f),
                        fontSize = 12.sp,
                        lineHeight = 18.sp
                    )
                    Spacer(modifier = Modifier.height(120.dp)) // space for buttons panel overlay
                }

                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { onDownloadCoverLetter(letterText, "pdf") },
                            modifier = Modifier.weight(1f).height(44.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.primary),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Download PDF", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                        Button(
                            onClick = { onDownloadCoverLetter(letterText, "docx") },
                            modifier = Modifier.weight(1f).height(44.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.primary),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Download DOCX", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("Cover Letter", letterText)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Copied to clipboard!", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary)
                    ) {
                        Text("Copy to Clipboard", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
