package com.aashi.resumeiq.ui.simulator

import com.aashi.resumeiq.ui.theme.getOutlinedTextFieldColors

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aashi.resumeiq.network.RecruiterSimulationResponse
import com.aashi.resumeiq.ui.auth.UiState
import com.aashi.resumeiq.ui.detail.DetailViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SimulatorScreen(
    resumeId: Int,
    viewModel: DetailViewModel,
    onNavigateBack: () -> Unit
) {
    var jdText by rememberSaveable { mutableStateOf("") }
    val simState by viewModel.simState.collectAsState()

    LaunchedEffect(resumeId) {
        viewModel.clearMatchAndSimStates()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Recruiter Simulator", color = MaterialTheme.colorScheme.onSurface) },
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
            when (val state = simState) {
                is UiState.Idle -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Paste the job description to run a simulated screening audit. Gemini will mimic an HR recruiter's evaluation matrix.",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            fontSize = 14.sp
                        )

                        OutlinedTextField(
                            value = jdText,
                            onValueChange = { jdText = it },
                            label = { Text("Job Description Text") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            shape = RoundedCornerShape(16.dp),
                            colors = getOutlinedTextFieldColors()
                        )

                        Button(
                            onClick = {
                                if (jdText.isNotBlank()) {
                                    viewModel.simulateRecruiter(resumeId, jdText.trim())
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary
                            )
                        ) {
                            Text("Simulate Recruiter Screening", fontSize = 16.sp, fontWeight = FontWeight.Bold)
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
                    SimulationResultView(sim = state.data)
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
fun SimulationResultView(sim: RecruiterSimulationResponse) {
    val decisionColor = when (sim.decision.lowercase()) {
        "shortlist" -> Color(0xFF4CAF50)
        "maybe" -> Color(0xFFFFC107)
        else -> Color(0xFFF44336)
    }

    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        // Decision banner
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Recruiter Decision",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(
                        modifier = Modifier
                            .background(decisionColor.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                            .border(1.5.dp, decisionColor, RoundedCornerShape(12.dp))
                            .padding(horizontal = 24.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = sim.decision,
                            color = decisionColor,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Interview Probability", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                        Box(
                            modifier = Modifier
                                .size(60.dp)
                                .background(decisionColor.copy(alpha = 0.08f), CircleShape)
                                .border(2.dp, decisionColor, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${sim.interviewProbability}%",
                                color = decisionColor,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                    }
                }
            }
        }

        // Reasoning
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Recruiter Reasoning", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = sim.reasoning,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                        fontSize = 12.sp,
                        lineHeight = 18.sp
                    )
                }
            }
        }

        // Strengths (Likes)
        if (sim.strengths.isNotEmpty()) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "Key Strengths Identified", color = Color(0xFF81C784), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        sim.strengths.forEach { item ->
                            Text(text = "✓ $item", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f), fontSize = 12.sp, modifier = Modifier.padding(vertical = 4.dp))
                        }
                    }
                }
            }
        }

        // Concerns (Risks)
        if (sim.concerns.isNotEmpty()) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "Key Gaps / Risks", color = Color(0xFFE57373), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        sim.concerns.forEach { item ->
                            Text(text = "✗ $item", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f), fontSize = 12.sp, modifier = Modifier.padding(vertical = 4.dp))
                        }
                    }
                }
            }
        }

        // Suggested Improvements
        if (sim.suggestedImprovements.isNotEmpty()) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "Actionable Improvements", color = MaterialTheme.colorScheme.tertiary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        sim.suggestedImprovements.forEach { item ->
                            Text(text = "• $item", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f), fontSize = 12.sp, modifier = Modifier.padding(vertical = 4.dp))
                        }
                    }
                }
            }
        }
    }
}
