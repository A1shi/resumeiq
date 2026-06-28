package com.aashi.resumeiq.ui.interview

import com.aashi.resumeiq.ui.theme.getOutlinedTextFieldColors

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
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
import com.aashi.resumeiq.network.ATSAnalysisSchema
import com.aashi.resumeiq.network.InterviewQuestion2Schema
import com.aashi.resumeiq.ui.auth.UiState
import com.aashi.resumeiq.ui.detail.DetailViewModel
import com.aashi.resumeiq.ui.detail.DownloadState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InterviewPrepScreen(
    resumeId: Int,
    viewModel: DetailViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val atsState by viewModel.atsState.collectAsState()
    val downloadState by viewModel.prepDownloadState.collectAsState()

    var jdText by rememberSaveable { mutableStateOf("") }
    var jobRole by rememberSaveable { mutableStateOf("") }
    var selectedTabIdx by rememberSaveable { mutableStateOf(0) }
    var activeDifficulty by rememberSaveable { mutableStateOf("ALL") }
    var isPracticeMode by rememberSaveable { mutableStateOf(false) }
    var currentQuestionIndex by rememberSaveable { mutableStateOf(0) }

    val tabs = listOf(
        "Resume-Based",
        "Job Description-Based",
        "Technical",
        "HR",
        "Behavioral",
        "Scenario-Based",
        "Project-Based",
        "Problem Solving"
    )
    val difficulties = listOf("ALL", "EASY", "MEDIUM", "HARD")

    LaunchedEffect(resumeId) {
        viewModel.fetchDetails(resumeId)
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
                title = { Text("Interview Preparation", color = MaterialTheme.colorScheme.onSurface) },
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
                .padding(horizontal = 16.dp)
        ) {
            when (val state = atsState) {
                is UiState.Loading -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Generating preparation questions...", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                    }
                }
                is UiState.Error -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Error: ${state.message}",
                            color = Color.Red,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { viewModel.fetchDetails(resumeId) },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text("Retry", color = MaterialTheme.colorScheme.onPrimary)
                        }
                    }
                }
                is UiState.Success -> {
                    val analysis = state.data
                    val prep = analysis.interviewPrep

                    // Sync target role if loaded
                    LaunchedEffect(analysis) {
                        if (jobRole.isBlank() && !analysis.profession.isNullOrBlank()) {
                            jobRole = analysis.profession
                        }
                    }

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        // JD & Target Role Configuration panel
                        item {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                shape = RoundedCornerShape(16.dp),
                                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "🎯 Target Setup for Preparation",
                                        color = MaterialTheme.colorScheme.onSurface,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "Define your target Job Role and paste the Job Description (JD) below to customize mock interview questions and readiness scores.",
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                        fontSize = 12.sp
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    
                                    OutlinedTextField(
                                        value = jobRole,
                                        onValueChange = { jobRole = it },
                                        placeholder = { Text("e.g. Senior Software Engineer", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)) },
                                        label = { Text("Target Job Role") },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = getOutlinedTextFieldColors()
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    OutlinedTextField(
                                        value = jdText,
                                        onValueChange = { jdText = it },
                                        placeholder = { Text("Paste job description text here (optional)...", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)) },
                                        label = { Text("Job Description") },
                                        modifier = Modifier.fillMaxWidth().height(100.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = getOutlinedTextFieldColors()
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Button(
                                        onClick = { 
                                            viewModel.generateInterviewPrep(
                                                resumeId = resumeId, 
                                                jdText = jdText.trim().ifBlank { null },
                                                jobRole = jobRole.trim().ifBlank { null }
                                            ) 
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Icon(Icons.Default.Refresh, contentDescription = "CPU", modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = if (prep != null) "Re-Generate Questions" else "Generate Questions",
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }

                        if (prep != null) {
                            val categoryKey = when (selectedTabIdx) {
                                0 -> "resume_questions"
                                1 -> "jd_questions"
                                2 -> "technical_questions"
                                3 -> "hr_questions"
                                4 -> "behavioral_questions"
                                5 -> "scenario_questions"
                                6 -> "project_questions"
                                else -> "problem_solving_questions"
                            }

                            val currentQuestions = when (selectedTabIdx) {
                                0 -> prep.resumeQuestions
                                1 -> prep.jdQuestions
                                2 -> prep.technicalQuestions
                                3 -> prep.hrQuestions
                                4 -> prep.behavioralQuestions
                                5 -> prep.scenarioQuestions
                                6 -> prep.projectQuestions
                                else -> prep.problemSolvingQuestions
                            }

                            val filteredQuestions = currentQuestions.filter { q ->
                                activeDifficulty == "ALL" || q.difficulty.equals(activeDifficulty, ignoreCase = true)
                            }

                            // Readiness Scores Dashboard
                            item {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    shape = RoundedCornerShape(16.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text(
                                            text = "📊 Mock Interview Readiness Audit",
                                            color = MaterialTheme.colorScheme.onSurface,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 15.sp
                                        )
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceEvenly
                                        ) {
                                            CircularReadinessCard(prep.overallReadiness, "Overall", MaterialTheme.colorScheme.primary)
                                            CircularReadinessCard(prep.technicalReadiness, "Technical", Color(0xFF10B981))
                                            CircularReadinessCard(prep.hrReadiness, "HR & Background", Color(0xFF3B82F6))
                                            CircularReadinessCard(prep.communicationReadiness, "Communication", Color(0xFFF59E0B))
                                        }
                                        Spacer(modifier = Modifier.height(16.dp))
                                        Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
                                        Spacer(modifier = Modifier.height(12.dp))
                                        
                                        // Action Row
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Button(
                                                onClick = { viewModel.downloadInterviewPrep(context, resumeId, "questions") },
                                                modifier = Modifier.weight(1f),
                                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.primary),
                                                shape = RoundedCornerShape(8.dp),
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                                            ) {
                                                Text("Download Sheet (PDF)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                            }
                                            Button(
                                                onClick = { 
                                                    isPracticeMode = !isPracticeMode
                                                    currentQuestionIndex = 0
                                                },
                                                modifier = Modifier.weight(1f),
                                                colors = ButtonDefaults.buttonColors(
                                                    containerColor = if (isPracticeMode) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                                                    contentColor = Color.White
                                                ),
                                                shape = RoundedCornerShape(8.dp),
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                                            ) {
                                                Text(if (isPracticeMode) "Exit Practice" else "Start Practice", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }

                            if (!isPracticeMode) {
                                // Personalized Question Explorer Card
                                item {
                                    Card(
                                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                        shape = RoundedCornerShape(16.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Column(modifier = Modifier.padding(16.dp)) {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(
                                                    text = "📚 Question Explorer",
                                                    color = MaterialTheme.colorScheme.onSurface,
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 15.sp
                                                )
                                                // Difficulty selector chips
                                                Row(
                                                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                                                    verticalAlignment = Alignment.CenterVertically
                                                ) {
                                                    difficulties.forEach { diff ->
                                                        val isSelected = activeDifficulty == diff
                                                        Box(
                                                            modifier = Modifier
                                                                .clip(RoundedCornerShape(6.dp))
                                                                .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                                                                .clickable { activeDifficulty = diff }
                                                                .padding(horizontal = 6.dp, vertical = 4.dp)
                                                        ) {
                                                            Text(
                                                                text = diff,
                                                                color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                                                fontSize = 9.sp,
                                                                fontWeight = FontWeight.Bold
                                                            )
                                                        }
                                                    }
                                                }
                                            }
                                            Spacer(modifier = Modifier.height(12.dp))

                                            // Category Tabs
                                            ScrollableTabRow(
                                                selectedTabIndex = selectedTabIdx,
                                                containerColor = Color.Transparent,
                                                contentColor = MaterialTheme.colorScheme.primary,
                                                edgePadding = 0.dp,
                                                divider = {}
                                            ) {
                                                tabs.forEachIndexed { index, title ->
                                                    Tab(
                                                        selected = selectedTabIdx == index,
                                                        onClick = { selectedTabIdx = index },
                                                        text = {
                                                            val count = when (index) {
                                                                0 -> prep.resumeQuestions.size
                                                                1 -> prep.jdQuestions.size
                                                                2 -> prep.technicalQuestions.size
                                                                3 -> prep.hrQuestions.size
                                                                4 -> prep.behavioralQuestions.size
                                                                5 -> prep.scenarioQuestions.size
                                                                6 -> prep.projectQuestions.size
                                                                else -> prep.problemSolvingQuestions.size
                                                            }
                                                            Text(
                                                                text = "$title ($count)",
                                                                fontWeight = FontWeight.Bold,
                                                                fontSize = 11.sp
                                                            )
                                                        },
                                                        selectedContentColor = MaterialTheme.colorScheme.primary,
                                                        unselectedContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }

                                if (filteredQuestions.isEmpty()) {
                                    item {
                                        Box(
                                            modifier = Modifier.fillMaxWidth().padding(32.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "No questions found for difficulty: $activeDifficulty",
                                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                                fontSize = 13.sp
                                            )
                                        }
                                    }
                                } else {
                                    itemsIndexed(filteredQuestions) { idx, q ->
                                        PracticeQuestionCard(
                                            question = q,
                                            onToggleStatus = { statusType ->
                                                viewModel.toggleInterviewQuestionStatus(
                                                    resumeId = resumeId,
                                                    category = categoryKey,
                                                    questionIdx = idx,
                                                    statusType = statusType
                                                )
                                            }
                                        )
                                    }
                                }
                            } else {
                                // Practice Mode Active
                                item {
                                    if (filteredQuestions.isEmpty()) {
                                        Box(
                                            modifier = Modifier.fillMaxWidth().padding(32.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "No questions in this category matching $activeDifficulty to practice.",
                                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                                fontSize = 13.sp
                                            )
                                        }
                                    } else {
                                        // Ensure valid index range
                                        if (currentQuestionIndex >= filteredQuestions.size) {
                                            currentQuestionIndex = 0
                                        }
                                        val activeQuestion = filteredQuestions[currentQuestionIndex]
                                        PracticeModeView(
                                            question = activeQuestion,
                                            currentIndex = currentQuestionIndex,
                                            totalCount = filteredQuestions.size,
                                            onPrevious = { currentQuestionIndex = maxOf(0, currentQuestionIndex - 1) },
                                            onNext = { currentQuestionIndex = minOf(filteredQuestions.size - 1, currentQuestionIndex + 1) },
                                            onToggleStatus = { statusType ->
                                                viewModel.toggleInterviewQuestionStatus(
                                                    resumeId = resumeId,
                                                    category = categoryKey,
                                                    questionIdx = currentQuestionIndex,
                                                    statusType = statusType
                                                )
                                            }
                                        )
                                    }
                                }
                            }
                        } else {
                            // Guide Not Generated Yet Message
                            item {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    shape = RoundedCornerShape(16.dp),
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)
                                ) {
                                    Column(
                                        modifier = Modifier.padding(24.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Icon(
                                            Icons.Default.Refresh,
                                            contentDescription = "Not Generated",
                                            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f),
                                            modifier = Modifier.size(64.dp)
                                        )
                                        Spacer(modifier = Modifier.height(16.dp))
                                        Text(
                                            text = "Interview Prep Questions Not Generated Yet",
                                            color = MaterialTheme.colorScheme.onSurface,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 16.sp,
                                            textAlign = TextAlign.Center
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "Generate custom mock interview questions, difficulties, and readiness indicators based on your profile, selected job role, and target JD.",
                                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                            fontSize = 12.sp,
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                else -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

@Composable
fun CircularReadinessCard(score: Int, label: String, color: Color) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.width(82.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(8.dp)
        ) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(54.dp)
            ) {
                CircularProgressIndicator(
                    progress = score / 100f,
                    strokeWidth = 5.dp,
                    color = color,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.fillMaxSize()
                )
                Text(
                    text = "$score%",
                    color = color,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = label,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center,
                maxLines = 2,
                lineHeight = 11.sp
            )
        }
    }
}

@Composable
fun PracticeQuestionCard(
    question: InterviewQuestion2Schema,
    onToggleStatus: (String) -> Unit
) {
    val difficultyColor = when (question.difficulty.lowercase()) {
        "easy" -> Color(0xFF10B981)
        "medium" -> Color(0xFFF59E0B)
        else -> Color(0xFFEF4444)
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(difficultyColor.copy(alpha = 0.15f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = question.difficulty.uppercase(),
                        color = difficultyColor,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = question.question,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f))
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { onToggleStatus("completed") }) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = "Completed",
                        tint = if (question.completed) Color(0xFF10B981) else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f),
                        modifier = Modifier.size(20.dp)
                    )
                }
                IconButton(onClick = { onToggleStatus("favorite") }) {
                    Icon(
                        Icons.Default.Star,
                        contentDescription = "Favorite",
                        tint = if (question.favorite) Color(0xFFF59E0B) else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f),
                        modifier = Modifier.size(20.dp)
                    )
                }
                IconButton(onClick = { onToggleStatus("needs_practice") }) {
                    Icon(
                        Icons.Default.Warning,
                        contentDescription = "Needs Practice",
                        tint = if (question.needsPractice) Color(0xFFEF4444) else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun PracticeModeView(
    question: InterviewQuestion2Schema,
    currentIndex: Int,
    totalCount: Int,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
    onToggleStatus: (String) -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            // Progress Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Progress: ${currentIndex + 1} of $totalCount",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Text(
                    text = "${((currentIndex + 1) * 100) / totalCount}%",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = (currentIndex + 1).toFloat() / totalCount,
                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
            Spacer(modifier = Modifier.height(24.dp))

            // Difficulty & Question Text
            val difficultyColor = when (question.difficulty.lowercase()) {
                "easy" -> Color(0xFF10B981)
                "medium" -> Color(0xFFF59E0B)
                else -> Color(0xFFEF4444)
            }
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(difficultyColor.copy(alpha = 0.15f))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = question.difficulty.uppercase(),
                    color = difficultyColor,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = question.question,
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold, lineHeight = 28.sp),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(24.dp))

            // Action Toggles
            Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatusToggleButton(
                    label = "Completed",
                    icon = Icons.Default.Check,
                    isActive = question.completed,
                    activeColor = Color(0xFF10B981),
                    modifier = Modifier.weight(1f),
                    onClick = { onToggleStatus("completed") }
                )
                StatusToggleButton(
                    label = "Favorite",
                    icon = Icons.Default.Star,
                    isActive = question.favorite,
                    activeColor = Color(0xFFF59E0B),
                    modifier = Modifier.weight(1f),
                    onClick = { onToggleStatus("favorite") }
                )
                StatusToggleButton(
                    label = "Practice",
                    icon = Icons.Default.Warning,
                    isActive = question.needsPractice,
                    activeColor = Color(0xFFEF4444),
                    modifier = Modifier.weight(1f),
                    onClick = { onToggleStatus("needs_practice") }
                )
            }
            Spacer(modifier = Modifier.height(24.dp))

            // Navigation Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onPrevious,
                    enabled = currentIndex > 0,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.onSurfaceVariant),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Previous")
                }
                Text(
                    text = "${currentIndex + 1} / $totalCount",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                )
                Button(
                    onClick = onNext,
                    enabled = currentIndex < totalCount - 1,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.onSurfaceVariant),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Next")
                }
            }
        }
    }
}

@Composable
fun StatusToggleButton(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isActive: Boolean,
    activeColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val containerColor = if (isActive) activeColor else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
    val contentColor = if (isActive) Color.White else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = containerColor, contentColor = contentColor),
        shape = RoundedCornerShape(10.dp),
        modifier = modifier,
        contentPadding = PaddingValues(vertical = 8.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, contentDescription = label, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(label, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}
