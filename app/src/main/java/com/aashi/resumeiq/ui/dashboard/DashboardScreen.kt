package com.aashi.resumeiq.ui.dashboard

import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshContainer
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aashi.resumeiq.network.RecentAnalysisItem
import com.aashi.resumeiq.ui.auth.AuthViewModel
import com.aashi.resumeiq.ui.auth.UiState
import com.aashi.resumeiq.ui.detail.DetailViewModel
import com.aashi.resumeiq.utils.convertImageToPdf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    authViewModel: AuthViewModel,
    detailViewModel: DetailViewModel,
    onNavigateToDetail: (Int) -> Unit,
    onNavigateToBuilder: (Int) -> Unit,
    onNavigateToTemplates: (Int) -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToHistory: () -> Unit,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val contentResolver = context.contentResolver
    val statsState by authViewModel.statsState.collectAsState()
    val uploadState by detailViewModel.uploadState.collectAsState()
    val uploadProgress by detailViewModel.uploadProgress.collectAsState()
    val userName by authViewModel.userName.collectAsState(initial = "User")

    // Modal / Popup States
    var showBuilderDialog by rememberSaveable { mutableStateOf(false) }
    var showTemplatesDialog by rememberSaveable { mutableStateOf(false) }
    var showUploadPromptDialog by rememberSaveable { mutableStateOf(false) }
    var showHistoryBottomSheet by rememberSaveable { mutableStateOf(false) }
    var selectedTemplate by rememberSaveable { mutableStateOf("Executive Slate (Recommended)") }

    // Duplicate Check States
    var showDuplicateDialog by rememberSaveable { mutableStateOf(false) }
    var duplicateFilename by rememberSaveable { mutableStateOf("") }
    var duplicateUriString by rememberSaveable { mutableStateOf<String?>(null) }
    val duplicateUri = duplicateUriString?.let { Uri.parse(it) }
    var isDuplicateImage by rememberSaveable { mutableStateOf(false) }

    var pendingRouteAction by rememberSaveable { mutableStateOf<String?>(null) }

    // Document Picker launcher restricted to PDF, DOCX, PNG, and JPEG
    val pickerMimeTypes = arrayOf(
        "application/pdf", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg"
    )

    // On start, fetch fresh statistics and user profile info from API
    LaunchedEffect(Unit) {
        authViewModel.fetchStats()
        authViewModel.fetchMe()
    }

    LaunchedEffect(uploadState) {
        if (uploadState is UiState.Success) {
            val resume = (uploadState as UiState.Success).data
            detailViewModel.clearUploadState()
            onNavigateToDetail(resume.id)
        } else if (uploadState is UiState.Error) {
            val errMsg = (uploadState as UiState.Error).message
            Toast.makeText(context, errMsg, Toast.LENGTH_LONG).show()
            detailViewModel.clearUploadState()
        }
    }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let { selectedUri ->
            var filename = "resume.pdf"
            contentResolver.query(selectedUri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (cursor.moveToFirst() && nameIndex != -1) {
                    filename = cursor.getString(nameIndex)
                }
            }

            val isImage = filename.endsWith(".png", true) || 
                          filename.endsWith(".jpg", true) || 
                          filename.endsWith(".jpeg", true)
            
            val targetFilename = if (isImage) {
                filename.substringBeforeLast(".") + ".pdf"
            } else {
                filename
            }

            // Check if filename already exists in dashboard history list
            val stats = (statsState as? UiState.Success)?.data
            val isDuplicate = stats?.recentAnalyses?.any { analysis ->
                analysis.filename.equals(targetFilename, ignoreCase = true)
            } ?: false

            if (isDuplicate) {
                duplicateFilename = targetFilename
                duplicateUriString = selectedUri.toString()
                isDuplicateImage = isImage
                showDuplicateDialog = true
            } else {
                try {
                    contentResolver.openInputStream(selectedUri)?.use { stream ->
                        var bytes = stream.readBytes()
                        if (isImage) {
                            bytes = convertImageToPdf(bytes)
                        }
                        detailViewModel.uploadResume(targetFilename, bytes)
                    }
                } catch (e: Exception) {
                    Toast.makeText(context, "Failed to read file: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    // Pull-to-refresh setup
    val pullToRefreshState = rememberPullToRefreshState()
    val isRefreshing = statsState is UiState.Loading
    
    if (pullToRefreshState.isRefreshing) {
        LaunchedEffect(true) {
            authViewModel.fetchStats()
            authViewModel.fetchMe()
        }
    }
    
    LaunchedEffect(isRefreshing) {
        if (isRefreshing) {
            pullToRefreshState.startRefresh()
        } else {
            pullToRefreshState.endRefresh()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "ResumeIQ",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Hello, $userName",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { 
                        authViewModel.fetchStats()
                        authViewModel.fetchMe()
                    }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = MaterialTheme.colorScheme.onSurface)
                    }
                    IconButton(onClick = onNavigateToProfile) {
                        Icon(Icons.Default.Person, contentDescription = "Profile", tint = MaterialTheme.colorScheme.onSurface)
                    }
                    IconButton(onClick = {
                        authViewModel.logout()
                        onLogout()
                    }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Logout", tint = MaterialTheme.colorScheme.onSurface)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { filePickerLauncher.launch(pickerMimeTypes) },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Upload Resume")
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .nestedScroll(pullToRefreshState.nestedScrollConnection)
        ) {
            when (val state = statsState) {
                is UiState.Success -> {
                    val stats = state.data
                    val scrollState = rememberScrollState()

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(scrollState)
                            .padding(16.dp)
                    ) {
                        // Greeting and Welcome Banner
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    Brush.horizontalGradient(
                                        colors = listOf(Color(0xFF162D2C), Color(0xFF0F1F1E))
                                    ),
                                    RoundedCornerShape(16.dp)
                                )
                                .padding(20.dp)
                        ) {
                            Column {
                                Text(
                                    text = "Welcome Back, $userName!",
                                    color = MaterialTheme.colorScheme.onSurface,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Let's optimize your professional profile today.",
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                    fontSize = 13.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        val isDark = MaterialTheme.colorScheme.background != Color(0xFFF4FAF9)

                        // Stats Grid (Row of 3 cards)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            StatCard(
                                title = "Total Resumes",
                                value = stats.totalResumes.toString(),
                                gradientColors = if (isDark) listOf(Color(0xFF1E3A38), Color(0xFF112322)) else listOf(Color(0xFFD2F5F2), Color(0xFFAFEBE6)),
                                modifier = Modifier.weight(1f)
                            )
                            StatCard(
                                title = "Average ATS",
                                value = if (stats.averageAtsScore > 0) "${stats.averageAtsScore.toInt()}%" else "N/A",
                                gradientColors = if (isDark) listOf(Color(0xFF2E3D2A), Color(0xFF192217)) else listOf(Color(0xFFE8F5E9), Color(0xFFC8E6C9)),
                                modifier = Modifier.weight(1f)
                            )
                            StatCard(
                                title = "Highest Score",
                                value = if (stats.highestAtsScore > 0) "${stats.highestAtsScore}%" else "N/A",
                                gradientColors = if (isDark) listOf(Color(0xFF3C2F23), Color(0xFF221A12)) else listOf(Color(0xFFFFF3E0), Color(0xFFFFE0B2)),
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Actions Section Title
                        Text(
                            text = "Actions & Features",
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // helper lambda to process navigation clicks
                        val handleNavAction: (String) -> Unit = { route ->
                            if (stats.recentAnalyses.isEmpty()) {
                                pendingRouteAction = route
                                showUploadPromptDialog = true
                            } else {
                                val latestResumeId = stats.recentAnalyses.first().id
                                when (route) {
                                    "detail" -> onNavigateToDetail(latestResumeId)
                                    "match" -> onNavigateToDetail(latestResumeId)
                                    "simulation" -> onNavigateToDetail(latestResumeId)
                                    "cover_letter" -> onNavigateToDetail(latestResumeId)
                                }
                            }
                        }

                        // Actions Grid (Responsive tablet layout)
                        val screenWidth = LocalConfiguration.current.screenWidthDp
                        val columns = if (screenWidth > 840) 4 else if (screenWidth > 600) 3 else 2

                        class ActionItem(
                            val title: String,
                            val description: String,
                            val icon: androidx.compose.ui.graphics.vector.ImageVector,
                            val iconColor: Color,
                            val backgroundColor: Color,
                            val onClick: () -> Unit
                        )

                        val actionItems = listOf(
                            ActionItem("ATS Resume Analysis", "Scan score, find gaps & keywords", Icons.Default.Search, if (isDark) Color(0xFF00E676) else Color(0xFF008D46), if (isDark) Color(0xFF112A27) else Color(0xFFE8F8F5), { handleNavAction("detail") }),
                            ActionItem("Resume Builder", "Create a standard professional CV", Icons.Default.Build, if (isDark) Color(0xFF29B6F6) else Color(0xFF0288D1), if (isDark) Color(0xFF132832) else Color(0xFFE1F5FE), { showBuilderDialog = true }),
                            ActionItem("Resume Templates", "Pick premium designed themes", Icons.Default.Create, if (isDark) Color(0xFFAB47BC) else Color(0xFF7B1FA2), if (isDark) Color(0xFF221A30) else Color(0xFFF3E5F5), { showTemplatesDialog = true }),
                            ActionItem("Job Matcher", "Compare resume to job post", Icons.Default.Done, if (isDark) Color(0xFFFF9100) else Color(0xFFE65100), if (isDark) Color(0xFF2C2216) else Color(0xFFFFF3E0), { handleNavAction("match") }),
                            ActionItem("Interview Prep", "Practice mock recruiter Q&A", Icons.Default.PlayArrow, if (isDark) Color(0xFFE91E63) else Color(0xFFC2185B), if (isDark) Color(0xFF2E1724) else Color(0xFFFCE4EC), { handleNavAction("simulation") }),
                            ActionItem("Cover Letter", "Generate custom letter variations", Icons.Default.Email, if (isDark) Color(0xFFFFD600) else Color(0xFFFBC02D), if (isDark) Color(0xFF2C2A15) else Color(0xFFFFFDE7), { handleNavAction("cover_letter") }),
                            ActionItem("Resume History", "View all previous uploads", Icons.Default.List, if (isDark) Color(0xFF26A69A) else Color(0xFF00796B), if (isDark) Color(0xFF132B28) else Color(0xFFE0F2F1), { onNavigateToHistory() }),
                            ActionItem("Settings & Profile", "Manage password & themes", Icons.Default.Settings, if (isDark) Color(0xFF78909C) else Color(0xFF455A64), if (isDark) Color(0xFF1E282C) else Color(0xFFECEFF1), { onNavigateToProfile() })
                        )

                        val chunkedItems = actionItems.chunked(columns)

                        Column(
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            chunkedItems.forEach { rowItems ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    rowItems.forEach { item ->
                                        ActionCard(
                                            title = item.title,
                                            description = item.description,
                                            icon = item.icon,
                                            iconColor = item.iconColor,
                                            backgroundColor = item.backgroundColor,
                                            onClick = item.onClick,
                                            modifier = Modifier.weight(1f)
                                        )
                                    }
                                    repeat(columns - rowItems.size) {
                                        Spacer(modifier = Modifier.weight(1f))
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))
                    }
                }
                is UiState.Error -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.Warning,
                            contentDescription = "Error",
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = state.message,
                            color = MaterialTheme.colorScheme.error,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { 
                                authViewModel.fetchStats()
                                authViewModel.fetchMe()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text("Retry", color = MaterialTheme.colorScheme.onPrimary)
                        }
                    }
                }
                else -> {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }

            // Material 3 pull to refresh indicator container
            PullToRefreshContainer(
                state = pullToRefreshState,
                modifier = Modifier.align(Alignment.TopCenter),
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary
            )

            // Upload Overlay Loader with progress indicator
            if (uploadState is UiState.Loading) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Black.copy(alpha = 0.7f),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        CircularProgressIndicator(
                            progress = { uploadProgress },
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Uploading: ${(uploadProgress * 100).toInt()}%",
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Analyzing & Parsing Resume...",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                            fontSize = 14.sp
                        )
                        Text(
                            text = "Using local structured intelligence",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }

    // Modal Builder Dialog
    if (showBuilderDialog) {
        AlertDialog(
            onDismissRequest = { showBuilderDialog = false },
            containerColor = MaterialTheme.colorScheme.surface,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Build, contentDescription = "Builder", tint = Color(0xFF29B6F6))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("ResumeIQ Builder", color = MaterialTheme.colorScheme.onSurface)
                }
            },
            text = {
                Column {
                    Text(
                        text = "Build a standard modern resume step-by-step or import details.",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = {
                            showBuilderDialog = false
                            filePickerLauncher.launch(pickerMimeTypes)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF29B6F6)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Import & Parse Existing PDF/DOCX", color = Color.Black)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = {
                            showBuilderDialog = false
                            onNavigateToBuilder(-1)
                        },
                        border = ButtonDefaults.outlinedButtonBorder.copy(width = 1.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Create from Blank Wizard", color = Color(0xFF29B6F6))
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showBuilderDialog = false }) {
                    Text("Close", color = Color(0xFF29B6F6))
                }
            }
        )
    }

    // Modal Templates Dialog
    if (showTemplatesDialog) {
        val stats = (statsState as? UiState.Success)?.data
        val recentAnalyses = stats?.recentAnalyses ?: emptyList()

        AlertDialog(
            onDismissRequest = { showTemplatesDialog = false },
            containerColor = MaterialTheme.colorScheme.surface,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Create, contentDescription = "Templates", tint = Color(0xFFAB47BC))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Premium Templates", color = MaterialTheme.colorScheme.onSurface)
                }
            },
            text = {
                if (recentAnalyses.isNotEmpty()) {
                    Column {
                        Text(
                            text = "Select a resume from your history to style and preview templates:",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(max = 240.dp)
                        ) {
                            items(recentAnalyses) { item ->
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            showTemplatesDialog = false
                                            onNavigateToTemplates(item.id)
                                        }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.List, contentDescription = "Resume", tint = MaterialTheme.colorScheme.primary)
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Column {
                                            Text(
                                                text = item.name ?: item.filename,
                                                color = MaterialTheme.colorScheme.onSurface,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp
                                            )
                                            Text(
                                                text = "Score: ${item.atsScore ?: 0}% | ${item.createdAt}",
                                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                                fontSize = 11.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    Column {
                        Text(
                            text = "You don't have any resumes uploaded or created yet. Please build a resume or upload one to apply styles.",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = {
                                showTemplatesDialog = false
                                filePickerLauncher.launch(pickerMimeTypes)
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Upload Resume PDF/DOCX")
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedButton(
                            onClick = {
                                showTemplatesDialog = false
                                onNavigateToBuilder(-1)
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Create from Blank Wizard", color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showTemplatesDialog = false }) {
                    Text("Close", color = Color(0xFFAB47BC))
                }
            }
        )
    }

    // Duplicate Check Warning Dialog
    if (showDuplicateDialog) {
        AlertDialog(
            onDismissRequest = { showDuplicateDialog = false },
            containerColor = MaterialTheme.colorScheme.surface,
            title = {
                Text("Duplicate Resume Detected", color = MaterialTheme.colorScheme.onSurface)
            },
            text = {
                Text(
                    text = "A resume with the filename '$duplicateFilename' has already been analyzed. Would you like to view the existing analysis or upload a new copy?",
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDuplicateDialog = false
                        val stats = (statsState as? UiState.Success)?.data
                        val existingItem = stats?.recentAnalyses?.find { it.filename.equals(duplicateFilename, ignoreCase = true) }
                        if (existingItem != null) {
                            onNavigateToDetail(existingItem.id)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("View Existing", color = MaterialTheme.colorScheme.onPrimary)
                }
            },
            dismissButton = {
                Row {
                    OutlinedButton(
                        onClick = {
                            showDuplicateDialog = false
                            duplicateUri?.let { selectedUri ->
                                try {
                                    contentResolver.openInputStream(selectedUri)?.use { stream ->
                                        var bytes = stream.readBytes()
                                        if (isDuplicateImage) {
                                            bytes = convertImageToPdf(bytes)
                                        }
                                        detailViewModel.uploadResume(duplicateFilename, bytes)
                                    }
                                } catch (e: Exception) {
                                    Toast.makeText(context, "Failed to read file: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                                }
                            }
                        },
                        border = ButtonDefaults.outlinedButtonBorder.copy(width = 1.dp)
                    ) {
                        Text("Upload New", color = MaterialTheme.colorScheme.primary)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    TextButton(onClick = { showDuplicateDialog = false }) {
                        Text("Cancel", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    }
                }
            }
        )
    }

    // Upload Prompt Dialog (If no resumes exist)
    if (showUploadPromptDialog) {
        AlertDialog(
            onDismissRequest = { showUploadPromptDialog = false },
            containerColor = MaterialTheme.colorScheme.surface,
            title = {
                Text("Upload Resume Required", color = MaterialTheme.colorScheme.onSurface)
            },
            text = {
                Text(
                    text = "You need to upload at least one resume to use this intelligence feature.",
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showUploadPromptDialog = false
                        filePickerLauncher.launch(pickerMimeTypes)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("Upload Now", color = MaterialTheme.colorScheme.onPrimary)
                }
            },
            dismissButton = {
                TextButton(onClick = { showUploadPromptDialog = false }) {
                    Text("Cancel", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                }
            }
        )
    }

    // Modal History Bottom Sheet
    if (showHistoryBottomSheet) {
        ModalBottomSheet(
            onDismissRequest = { showHistoryBottomSheet = false },
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = Color.White
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 16.dp)
            ) {
                Text(
                    text = "Upload History",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                val stats = (statsState as? UiState.Success)?.data
                if (stats == null || stats.recentAnalyses.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxWidth().height(100.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No analysis history found", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 24.dp)
                    ) {
                        items(stats.recentAnalyses) { item ->
                            RecentAnalysisItemRow(
                                item = item,
                                onClick = {
                                    showHistoryBottomSheet = false
                                    onNavigateToDetail(item.id)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActionCard(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color,
    backgroundColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        modifier = modifier
            .fillMaxWidth()
            .height(115.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(iconColor.copy(alpha = 0.15f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = title, tint = iconColor, modifier = Modifier.size(20.dp))
            }
            Column {
                Text(
                    text = title,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = description,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    fontSize = 10.sp,
                    lineHeight = 12.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    gradientColors: List<Color>,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .height(100.dp)
            .background(
                Brush.verticalGradient(gradientColors),
                RoundedCornerShape(16.dp)
            )
            .padding(12.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = title,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = value,
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 24.sp,
                fontWeight = FontWeight.Black
            )
        }
    }
}

@Composable
fun RecentAnalysisItemRow(
    item: RecentAnalysisItem,
    onClick: () -> Unit
) {
    val scoreColor = when {
        item.atsScore == null -> Color.Gray
        item.atsScore >= 70 -> Color(0xFF4CAF50)
        item.atsScore >= 50 -> Color(0xFFFFC107)
        else -> Color(0xFFF44336)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Round score indicator
        Box(
            modifier = Modifier
                .size(48.dp)
                .background(scoreColor.copy(alpha = 0.1f), CircleShape)
                .clip(CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = item.atsScore?.toString() ?: "--",
                color = scoreColor,
                fontWeight = FontWeight.Black,
                fontSize = 16.sp
            )
        }

        Spacer(modifier = Modifier.width(16.dp))

        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = item.name ?: item.filename,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Uploaded on: ${item.createdAt.substringBefore("T")}",
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                fontSize = 12.sp
            )
        }
    }
}
