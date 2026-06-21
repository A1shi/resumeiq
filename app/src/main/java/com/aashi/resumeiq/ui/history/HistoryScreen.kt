package com.aashi.resumeiq.ui.history

import com.aashi.resumeiq.ui.theme.getOutlinedTextFieldColors

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aashi.resumeiq.network.ResumeListResponse
import com.aashi.resumeiq.ui.auth.UiState
import com.aashi.resumeiq.ui.detail.DetailViewModel
import com.aashi.resumeiq.ui.detail.DownloadState
import java.text.SimpleDateFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    viewModel: DetailViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToDetail: (Int) -> Unit
) {
    val context = LocalContext.current
    val historyState by viewModel.historyState.collectAsState()
    val latestMatches by viewModel.latestMatches.collectAsState()
    val downloadState by viewModel.prepDownloadState.collectAsState()

    var searchQuery by rememberSaveable { mutableStateOf("") }
    var sortBy by rememberSaveable { mutableStateOf("Date") } // Date, Score, Name
    var sortAscending by rememberSaveable { mutableStateOf(false) }

    var showDeleteConfirmDialog by rememberSaveable { mutableStateOf<Int?>(null) }

    LaunchedEffect(Unit) {
        viewModel.fetchHistory()
    }

    LaunchedEffect(historyState) {
        if (historyState is UiState.Success) {
            val list = (historyState as UiState.Success).data
            viewModel.fetchLatestMatchesForHistory(list)
        }
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
                title = { Text("Resume History", color = MaterialTheme.colorScheme.onSurface) },
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search resumes...", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)) },
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                shape = RoundedCornerShape(12.dp),
                colors = getOutlinedTextFieldColors()
            )

            // Sorting Controls Row
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Sort by:", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 12.sp)
                    listOf("Date", "Score", "Name").forEach { criterion ->
                        val isSelected = sortBy == criterion
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                                .clickable { sortBy = criterion }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = criterion,
                                color = if (isSelected) MaterialTheme.colorScheme.onPrimary else Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                IconButton(
                    onClick = { sortAscending = !sortAscending }
                ) {
                    Icon(
                        imageVector = if (sortAscending) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = "Sort Direction",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            when (val state = historyState) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                    }
                }
                is UiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(text = "Error loading history: ${state.message}", color = Color.Red, textAlign = TextAlign.Center)
                    }
                }
                is UiState.Success -> {
                    val rawList = state.data

                    // Perform local search and sorting
                    val filteredList = rawList.filter {
                        it.filename.contains(searchQuery, ignoreCase = true) ||
                        (it.name ?: "").contains(searchQuery, ignoreCase = true)
                    }

                    val sortedList = when (sortBy) {
                        "Name" -> {
                            if (sortAscending) filteredList.sortedBy { it.filename.lowercase() }
                            else filteredList.sortedByDescending { it.filename.lowercase() }
                        }
                        "Score" -> {
                            if (sortAscending) filteredList.sortedBy { it.atsScore ?: -1 }
                            else filteredList.sortedByDescending { it.atsScore ?: -1 }
                        }
                        else -> { // Date
                            val parser = SimpleDateFormat("yyyy-MM-dd", Locale.US)
                            if (sortAscending) filteredList.sortedBy {
                                try { parser.parse(it.createdAt.substringBefore("T")) } catch (e: Exception) { null }
                            } else filteredList.sortedByDescending {
                                try { parser.parse(it.createdAt.substringBefore("T")) } catch (e: Exception) { null }
                            }
                        }
                    }

                    if (sortedList.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                            Text("No resumes found", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 14.sp)
                        }
                    } else {
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxSize().padding(bottom = 16.dp)
                        ) {
                            items(sortedList) { resume ->
                                val score = latestMatches[resume.id]
                                HistoryItemCard(
                                    resume = resume,
                                    jdMatchScore = score,
                                    onClick = { onNavigateToDetail(resume.id) },
                                    onDeleteClick = { showDeleteConfirmDialog = resume.id },
                                    onDownloadPdf = { viewModel.downloadResumeTemplate(context, resume.id, "pdf") },
                                    onDownloadDocx = { viewModel.downloadResumeTemplate(context, resume.id, "docx") }
                                )
                            }
                        }
                    }
                }
                else -> {}
            }
        }
    }

    // Deletion confirmation Dialog
    showDeleteConfirmDialog?.let { resumeId ->
        AlertDialog(
            onDismissRequest = { showDeleteConfirmDialog = null },
            title = { Text("Delete Resume", color = MaterialTheme.colorScheme.onSurface) },
            text = { Text("Are you sure you want to delete this resume? This action cannot be undone.", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)) },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteResume(resumeId)
                        showDeleteConfirmDialog = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Delete", color = MaterialTheme.colorScheme.onSurface)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirmDialog = null }) {
                    Text("Cancel", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                }
            },
            containerColor = MaterialTheme.colorScheme.surface
        )
    }
}

@Composable
fun HistoryItemCard(
    resume: ResumeListResponse,
    jdMatchScore: Int?,
    onClick: () -> Unit,
    onDeleteClick: () -> Unit,
    onDownloadPdf: () -> Unit,
    onDownloadDocx: () -> Unit
) {
    val parser = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.US)
    val formattedDate = try {
        val date = parser.parse(resume.createdAt.substringBefore("T"))
        date?.let { outputFormat.format(it) } ?: resume.createdAt
    } catch (e: Exception) {
        resume.createdAt
    }

    val atsColor = when {
        resume.atsScore == null -> Color.White.copy(alpha = 0.5f)
        resume.atsScore >= 80 -> Color(0xFF10B981)
        resume.atsScore >= 50 -> Color(0xFFF59E0B)
        else -> Color(0xFFEF4444)
    }

    val jdMatchColor = when {
        jdMatchScore == null -> Color.White.copy(alpha = 0.5f)
        jdMatchScore >= 80 -> Color(0xFF10B981)
        jdMatchScore >= 50 -> Color(0xFFF59E0B)
        else -> Color(0xFFEF4444)
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth().clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = resume.filename,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        maxLines = 1
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Uploaded: $formattedDate",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                        fontSize = 12.sp
                    )
                }

                IconButton(
                    onClick = onDeleteClick,
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFEF4444), modifier = Modifier.size(20.dp))
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
            Spacer(modifier = Modifier.height(12.dp))

            // ATS Score & JD Match Section
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("ATS score", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = resume.atsScore?.let { "$it%" } ?: "Pending",
                        color = atsColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Latest JD Match", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = jdMatchScore?.let { "$it%" } ?: "N/A",
                        color = jdMatchColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Downloads Options
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onDownloadPdf,
                    modifier = Modifier.weight(1f).height(36.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.primary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text("Resume PDF", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = onDownloadDocx,
                    modifier = Modifier.weight(1f).height(36.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.primary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text("Resume DOCX", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
