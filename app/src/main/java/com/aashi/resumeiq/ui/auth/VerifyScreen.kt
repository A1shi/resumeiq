package com.aashi.resumeiq.ui.auth

import com.aashi.resumeiq.ui.theme.getOutlinedTextFieldColors

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun VerifyScreen(
    email: String,
    viewModel: AuthViewModel,
    onVerificationSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    var code by rememberSaveable { mutableStateOf("") }
    var codeError by rememberSaveable { mutableStateOf<String?>(null) }

    fun validateInputs(): Boolean {
        var isValid = true
        if (code.isBlank()) {
            codeError = "Verification code cannot be empty"
            isValid = false
        } else if (code.length != 6 || code.toIntOrNull() == null) {
            codeError = "Verification code must be exactly 6 digits"
            isValid = false
        } else {
            codeError = null
        }
        return isValid
    }

    val actionState by viewModel.actionState.collectAsState()

    LaunchedEffect(actionState) {
        if (actionState is UiState.Success) {
            val msg = (actionState as UiState.Success).data
            if (msg.contains("verified", ignoreCase = true)) {
                onVerificationSuccess()
                viewModel.clearStates()
            }
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
            )
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Verify Email",
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Enter the 6-digit code sent to $email",
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                fontSize = 14.sp
            )

            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = code,
                onValueChange = { 
                    if (it.length <= 6) {
                        code = it
                        codeError = null
                    }
                },
                label = { Text("6-Digit Code") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = "Verification Code") },
                isError = codeError != null,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = getOutlinedTextFieldColors(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            if (codeError != null) {
                Text(
                    text = codeError ?: "",
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 12.sp,
                    modifier = Modifier.align(Alignment.Start).padding(start = 8.dp, top = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = { viewModel.resendCode(email) }) {
                    Text("Resend Code", color = MaterialTheme.colorScheme.primary, fontSize = 14.sp)
                }
                
                TextButton(onClick = onNavigateToLogin) {
                    Text("Back to Login", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 14.sp)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            if (actionState is UiState.Error) {
                Text(
                    text = (actionState as UiState.Error).message,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            } else if (actionState is UiState.Success && !(actionState as UiState.Success).data.contains("verified")) {
                Text(
                    text = (actionState as UiState.Success).data,
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            }

            Button(
                onClick = {
                    if (validateInputs()) {
                        viewModel.verifyEmail(email, code.trim())
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                enabled = actionState !is UiState.Loading,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                )
            ) {
                if (actionState is UiState.Loading) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(24.dp))
                } else {
                    Text("Verify", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
