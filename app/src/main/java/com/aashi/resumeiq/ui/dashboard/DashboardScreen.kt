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
import androidx.compose.foundation.isSystemInDarkTheme
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
import com.aashi.resumeiq.ui.tour.*

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
    val isDark = isSystemInDarkTheme()
    val contentResolver = context.contentResolver
    val statsState by authViewModel.statsState.collectAsState()
    val uploadState by detailViewModel.uploadState.collectAsState()
    val uploadProgress by detailViewModel.uploadProgress.collectAsState()
    val userName by authViewModel.userName.collectAsState(initial = "User")
    val dashboardTourCompleted by authViewModel.dashboardTourCompleted.collectAsState(initial = true)

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
    var favorites by remember { mutableStateOf(setOf<Int>()) }
    var searchQuery by rememberSaveable { mutableStateOf("") }
    var uploadingFileName by rememberSaveable { mutableStateOf("") }
    var uploadingFileSize by rememberSaveable { mutableStateOf("") }
    var showPickerExplanationDialog by remember { mutableStateOf(false) }
    val explanationShown by authViewModel.pickerExplanationShown.collectAsState(initial = false)
    val scope = rememberCoroutineScope()

    // Document Picker launcher restricted to PDF, DOCX, and DOC
    val pickerMimeTypes = arrayOf(
        "application/pdf", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
    )

    // On start, fetch fresh statistics and user profile info from API
    LaunchedEffect(Unit) {
        authViewModel.fetchStats()
        authViewModel.fetchMe()
    }

    LaunchedEffect(uploadState) {
        if (uploadState is UiState.Success) {
            val resume = (uploadState as UiState.Success).data
            Toast.makeText(context, "Upload successful! Parsing resume...", Toast.LENGTH_SHORT).show()
            kotlinx.coroutines.delay(600)
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
        if (uri == null) {
            Toast.makeText(context, "Selection cancelled", Toast.LENGTH_SHORT).show()
            return@rememberLauncherForActivityResult
        }

        try {
            var filename = "resume.pdf"
            var fileSize: Long = 0

            contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (cursor.moveToFirst() && nameIndex != -1) {
                    filename = cursor.getString(nameIndex)
                }
                val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                if (cursor.moveToFirst() && sizeIndex != -1) {
                    fileSize = cursor.getLong(sizeIndex)
                }
            }

            val lowerName = filename.lowercase()
            if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx") && !lowerName.endsWith(".doc")) {
                Toast.makeText(context, "Unsupported file format! Please choose a PDF, DOC, or DOCX document.", Toast.LENGTH_LONG).show()
                return@rememberLauncherForActivityResult
            }

            if (fileSize <= 0) {
                Toast.makeText(context, "Cannot read file: The selected document is empty.", Toast.LENGTH_LONG).show()
                return@rememberLauncherForActivityResult
            }

            if (fileSize > 10 * 1024 * 1024) { // 10MB limit
                Toast.makeText(context, "File is too large! Maximum allowed size is 10MB.", Toast.LENGTH_LONG).show()
                return@rememberLauncherForActivityResult
            }

            uploadingFileName = filename
            uploadingFileSize = if (fileSize > 1024 * 1024) {
                String.format("%.2f MB", fileSize / (1024.0 * 1024.0))
            } else {
                String.format("%.1f KB", fileSize / 1024.0)
            }

            // Check if filename already exists in dashboard history list
            val stats = (statsState as? UiState.Success)?.data
            val isDuplicate = stats?.recentAnalyses?.any { analysis ->
                analysis.filename.equals(filename, ignoreCase = true)
            } ?: false

            if (isDuplicate) {
                duplicateFilename = filename
                duplicateUriString = uri.toString()
                isDuplicateImage = false
                showDuplicateDialog = true
            } else {
                contentResolver.openInputStream(uri)?.use { stream ->
                    val bytes = stream.readBytes()
                    detailViewModel.uploadResume(filename, bytes)
                }
            }
        } catch (e: Exception) {
            Toast.makeText(context, "Failed to parse document: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
        }
    }

    fun triggerFilePicker() {
        if (!explanationShown) {
            showPickerExplanationDialog = true
        } else {
            filePickerLauncher.launch(pickerMimeTypes)
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
                onClick = { triggerFilePicker() },
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
                        val welcomeGradient = if (isDark) {
                            Brush.horizontalGradient(
                                colors = listOf(Color(0xFF162D2C), Color(0xFF0F1F1E))
                            )
                        } else {
                            Brush.horizontalGradient(
                                colors = listOf(Color(0xFF0F766E), Color(0xFF0D9488))
                            )
                        }
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(welcomeGradient, RoundedCornerShape(16.dp))
                                .padding(20.dp)
                        ) {
                            Column {
                                Text(
                                    text = "Welcome Back, $userName!",
                                    color = Color.White,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Let's optimize your professional profile today.",
                                    color = Color.White.copy(alpha = 0.85f),
                                    fontSize = 13.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Premium Upload Card
                        OutlinedCard(
                            onClick = { triggerFilePicker() },
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .background(
                                            MaterialTheme.colorScheme.primaryContainer,
                                            shape = RoundedCornerShape(12.dp)
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Description,
                                        contentDescription = "Upload Document",
                                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                                
                                Spacer(modifier = Modifier.width(16.dp))
                                
                                Column(
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(
                                        text = "Upload Resume",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "Supported: PDF • DOCX • DOC",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "Choose from: Downloads, Google Drive, Cloud Storage",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    )
                                }
                                
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = "Choose File",
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Search Bar
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            placeholder = { Text("Search resumes, cover letters, templates...", fontSize = 14.sp) },
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = MaterialTheme.colorScheme.surface,
                                unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                                focusedBorderColor = MaterialTheme.colorScheme.primary,
                                unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                            )
                        )

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
                            ActionItem("Cover Letter", "Generate custom letter variations", Icons.Default.Description, if (isDark) Color(0xFFFFD600) else Color(0xFFFBC02D), if (isDark) Color(0xFF2C2A15) else Color(0xFFFFFDE7), { handleNavAction("cover_letter") }),
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

                        // Recent Activity & Favorites Header
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Recent Activity",
                                color = MaterialTheme.colorScheme.onSurface,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                            TextButton(onClick = { onNavigateToHistory() }) {
                                Text("View All", color = MaterialTheme.colorScheme.primary)
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Filter Tabs
                        var selectedTab by remember { mutableStateOf("All") }
                        val tabs = listOf("All", "Favorites", "Cover Letters", "Templates")
                        ScrollableTabRow(
                            selectedTabIndex = tabs.indexOf(selectedTab),
                            edgePadding = 0.dp,
                            containerColor = Color.Transparent,
                            divider = {},
                            indicator = {}
                        ) {
                            tabs.forEach { tab ->
                                val isSelected = tab == selectedTab
                                Tab(
                                    selected = isSelected,
                                    onClick = { selectedTab = tab },
                                    text = {
                                        Text(
                                            text = tab,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Filter recent items based on search query, tab, and favorites
                        val filteredItems = remember(stats.recentAnalyses, searchQuery, selectedTab, favorites) {
                            stats.recentAnalyses.filter { item ->
                                val matchesSearch = item.filename.contains(searchQuery, ignoreCase = true)
                                val matchesTab = when (selectedTab) {
                                    "Favorites" -> favorites.contains(item.id)
                                    else -> true
                                }
                                matchesSearch && matchesTab
                            }
                        }

                        if (filteredItems.isEmpty()) {
                            // Premium Empty State Screen
                            Card(
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)),
                                shape = RoundedCornerShape(16.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 8.dp)
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(24.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Info,
                                        contentDescription = "Empty State",
                                        tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f),
                                        modifier = Modifier.size(48.dp)
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Text(
                                        text = if (selectedTab == "Favorites") "No Favorites Yet" else "No Recent Activity",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = if (selectedTab == "Favorites") 
                                            "Star your top resumes to access them quickly here." 
                                        else 
                                            "Upload your resume or use the builder to get started.",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        } else {
                            // Render items list
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                filteredItems.forEach { item ->
                                    val isFav = favorites.contains(item.id)
                                    Card(
                                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                        shape = RoundedCornerShape(12.dp),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable { onNavigateToDetail(item.id) }
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(14.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(40.dp)
                                                    .background(
                                                        MaterialTheme.colorScheme.primaryContainer,
                                                        shape = RoundedCornerShape(8.dp)
                                                    ),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Description,
                                                    contentDescription = "Resume File",
                                                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                                    modifier = Modifier.size(20.dp)
                                                )
                                            }

                                            Spacer(modifier = Modifier.width(12.dp))

                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    text = item.filename,
                                                    fontWeight = FontWeight.SemiBold,
                                                    fontSize = 14.sp,
                                                    color = MaterialTheme.colorScheme.onSurface,
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis
                                                )
                                                Spacer(modifier = Modifier.height(2.dp))
                                                Row(verticalAlignment = Alignment.CenterVertically) {
                                                    Text(
                                                        text = "Score: ${item.atsScore ?: 0}%",
                                                        fontSize = 11.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = if ((item.atsScore ?: 0) >= 70) Color(0xFF00E676) else Color(0xFFFF9100)
                                                    )
                                                    Spacer(modifier = Modifier.width(8.dp))
                                                    Text(
                                                        text = "•  ${item.createdAt}",
                                                        fontSize = 11.sp,
                                                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                                                    )
                                                }
                                            }

                                            // Favorite Toggle Button
                                            IconButton(
                                                onClick = {
                                                    favorites = if (isFav) {
                                                        favorites - item.id
                                                    } else {
                                                        favorites + item.id
                                                    }
                                                }
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Star,
                                                    contentDescription = "Favorite",
                                                    tint = if (isFav) Color(0xFFFFD600) else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
                                                )
                                            }
                                        }
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
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(48.dp)
                        )
                        Text(
                            text = "Loading dashboard assets...",
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        // Mock Skeleton cards
                        repeat(3) {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
                                shape = RoundedCornerShape(16.dp),
                                modifier = Modifier.fillMaxWidth().height(84.dp)
                            ) {}
                        }
                    }
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
                    color = Color.Black.copy(alpha = 0.75f),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.size(100.dp)
                        ) {
                            CircularProgressIndicator(
                                progress = { uploadProgress },
                                color = MaterialTheme.colorScheme.primary,
                                strokeWidth = 6.dp,
                                modifier = Modifier.fillMaxSize()
                            )
                            Icon(
                                imageVector = Icons.Default.Description,
                                contentDescription = "Uploading",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(40.dp)
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Text(
                            text = "Uploading Document",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = uploadingFileName,
                            color = Color.White.copy(alpha = 0.9f),
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center
                        )
                        
                        Text(
                            text = uploadingFileSize,
                            color = Color.White.copy(alpha = 0.6f),
                            fontSize = 12.sp
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        LinearProgressIndicator(
                            progress = { uploadProgress },
                            color = MaterialTheme.colorScheme.primary,
                            trackColor = Color.White.copy(alpha = 0.2f),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "Uploading: ${(uploadProgress * 100).toInt()}%",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "Analyzing & Parsing Resume...",
                            color = Color.White.copy(alpha = 0.7f),
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
                            triggerFilePicker()
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
                                triggerFilePicker()
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
                        triggerFilePicker()
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

    if (showPickerExplanationDialog) {
        AlertDialog(
            onDismissRequest = { showPickerExplanationDialog = false },
            title = {
                Text(
                    text = "Choose Your Resume",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "ResumeIQ needs access to a resume file that you select.\n\n" +
                               "The app only accesses the document you choose and never scans or reads other files on your device.\n\n" +
                               "Supported formats:\n• PDF\n• DOCX\n• DOC",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showPickerExplanationDialog = false
                        authViewModel.setPickerExplanationShown(true)
                        filePickerLauncher.launch(pickerMimeTypes)
                    }
                ) {
                    Text("Continue")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showPickerExplanationDialog = false }
                ) {
                    Text("Cancel", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                }
            },
            containerColor = MaterialTheme.colorScheme.surface
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

    if (!dashboardTourCompleted) {
        FeatureTourOverlay(
            steps = listOf(
                TourStep("Quick Actions", "Instantly upload an existing resume PDF/DOCX or build one step-by-step using our interactive builder wizard.", "Quick Actions"),
                TourStep("Recent Activity", "Review and manage all your recently optimized resumes, templates, cover letters, and track their latest ATS scoring benchmarks.", "Recent Activity")
            ),
            onTourFinish = { authViewModel.setDashboardTourCompleted(true) }
        )
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
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp, pressedElevation = 4.dp),
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
                    .background(iconColor.copy(alpha = 0.12f), RoundedCornerShape(8.dp)),
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
