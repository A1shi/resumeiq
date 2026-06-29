package com.aashi.resumeiq.ui.auth

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material3.MaterialTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.getValue
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.TextButton
import androidx.compose.material3.ButtonDefaults
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import kotlinx.coroutines.launch

suspend fun proceedToNavigation(
    viewModel: AuthViewModel,
    onNavigateToDashboard: () -> Unit,
    onNavigateToVerify: (String) -> Unit,
    onNavigateToWelcome: () -> Unit,
    onNavigateToOnboarding: () -> Unit
) {
    // Intercept and redirect to onboarding on first launch
    val onboardingCompleted = viewModel.onboardingCompleted.first()
    if (!onboardingCompleted) {
        onNavigateToOnboarding()
        return
    }

    // Check local token state
    val remember = viewModel.rememberMe.first()
    if (!remember) {
        viewModel.logout()
        while (!viewModel.isLoggedIn.first().isNullOrEmpty()) {
            delay(10)
        }
    }

    val token = viewModel.isLoggedIn.first()
    val email = viewModel.userEmail.first() ?: ""

    if (token.isNullOrEmpty()) {
        onNavigateToWelcome()
    } else {
        // Attempt to validate current session with the backend API
        viewModel.validateSession(
            onSuccess = { verified ->
                if (verified) {
                    onNavigateToDashboard()
                } else {
                    onNavigateToVerify(email)
                }
            },
            onError = { isOffline ->
                if (isOffline) {
                    // Offline state: allow entry to dashboard since local session exists
                    onNavigateToDashboard()
                } else {
                    // Invalid token/session: clear and redirect to welcome/login
                    viewModel.logout()
                    onNavigateToWelcome()
                }
            }
        )
    }
}

@Composable
fun SplashScreen(
    viewModel: AuthViewModel,
    onNavigateToDashboard: () -> Unit,
    onNavigateToVerify: (String) -> Unit,
    onNavigateToWelcome: () -> Unit,
    onNavigateToOnboarding: () -> Unit
) {
    val scale = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()
    var showDisclaimer by remember { mutableStateOf(false) }
    var showSubPrivacy by remember { mutableStateOf(false) }
    var showSubTerms by remember { mutableStateOf(false) }

    LaunchedEffect(key1 = true) {
        scale.animateTo(
            targetValue = 1f,
            animationSpec = tween(
                durationMillis = 800
            )
        )
        delay(1000) // Ensure the splash screen displays for at least 1 second

        val accepted = viewModel.disclaimerAccepted.first()
        if (!accepted) {
            showDisclaimer = true
        } else {
            proceedToNavigation(viewModel, onNavigateToDashboard, onNavigateToVerify, onNavigateToWelcome, onNavigateToOnboarding)
        }
    }

    if (showDisclaimer) {
        AlertDialog(
            onDismissRequest = { /* Prevent closing by clicking outside */ },
            title = { Text(text = "Important Notice", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier.verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "ResumeIQ uses Artificial Intelligence (AI) to assist with resume analysis, resume generation, cover letters, ATS scoring, recruiter simulations and interview preparation.\n\n" +
                                "AI-generated content may occasionally contain mistakes, incomplete information, formatting issues or inaccurate suggestions.\n\n" +
                                "Please carefully review all generated content before using it for job applications.\n\n" +
                                "ResumeIQ does not guarantee interviews, employment or ATS success.",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            },
            confirmButton = {
                Button(onClick = {
                    viewModel.setDisclaimerAccepted(true)
                    showDisclaimer = false
                    scope.launch {
                        proceedToNavigation(viewModel, onNavigateToDashboard, onNavigateToVerify, onNavigateToWelcome, onNavigateToOnboarding)
                    }
                }) {
                    Text("✔ I Understand")
                }
            },
            dismissButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextButton(onClick = { showSubPrivacy = true }) {
                        Text("Privacy Policy", fontSize = 12.sp)
                    }
                    TextButton(onClick = { showSubTerms = true }) {
                        Text("Terms", fontSize = 12.sp)
                    }
                }
            },
            containerColor = MaterialTheme.colorScheme.surface
        )
    }

    if (showSubPrivacy) {
        AlertDialog(
            onDismissRequest = { showSubPrivacy = false },
            title = { Text("Privacy Policy", fontWeight = FontWeight.Bold) },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    Text(
                        text = "ResumeIQ collects account emails, resume uploads, profile names, and document drafts to perform ATS analysis and resume generation. We never sell your data. Secure data hosting is powered by Supabase, Render, Brevo, and AI endpoints. Read the full details inside Profile & Settings.",
                        fontSize = 14.sp
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showSubPrivacy = false }) {
                    Text("Close")
                }
            }
        )
    }

    if (showSubTerms) {
        AlertDialog(
            onDismissRequest = { showSubTerms = false },
            title = { Text("Terms & Conditions", fontWeight = FontWeight.Bold) },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    Text(
                        text = "Use ResumeIQ for personal career planning. Output is generated \"AS IS\" without guarantees of jobs or interviews. Always proofread AI-generated suggestions before applying.",
                        fontSize = 14.sp
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showSubTerms = false }) {
                    Text("Close")
                }
            }
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.background,
                        MaterialTheme.colorScheme.surface
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .scale(scale.value)
                    .background(
                        Brush.linearGradient(
                            colors = listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.tertiary)
                        ),
                        shape = RoundedCornerShape(28.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "IQ",
                    color = MaterialTheme.colorScheme.onPrimary,
                    fontSize = 46.sp,
                    fontWeight = FontWeight.Black
                )
            }
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "ResumeIQ",
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
