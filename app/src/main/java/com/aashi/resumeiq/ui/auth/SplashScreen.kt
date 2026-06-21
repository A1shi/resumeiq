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

@Composable
fun SplashScreen(
    viewModel: AuthViewModel,
    onNavigateToDashboard: () -> Unit,
    onNavigateToVerify: (String) -> Unit,
    onNavigateToWelcome: () -> Unit
) {
    val scale = remember { Animatable(0f) }

    LaunchedEffect(key1 = true) {
        scale.animateTo(
            targetValue = 1f,
            animationSpec = tween(
                durationMillis = 800
            )
        )
        delay(1000) // Ensure the splash screen displays for at least 1 second

        // Check local token state
        val token = viewModel.isLoggedIn.first()
        val email = viewModel.userEmail.first() ?: ""
        val isVerified = viewModel.isUserVerified.first()

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
