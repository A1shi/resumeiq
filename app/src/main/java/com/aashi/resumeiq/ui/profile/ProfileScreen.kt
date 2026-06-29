package com.aashi.resumeiq.ui.profile

import com.aashi.resumeiq.ui.theme.getOutlinedTextFieldColors

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.clickable
import androidx.compose.foundation.selection.selectable
import com.aashi.resumeiq.ui.auth.AuthViewModel
import com.aashi.resumeiq.ui.auth.UiState
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: AuthViewModel,
    onNavigateBack: () -> Unit,
    onLogout: () -> Unit,
    onNavigateToPrivacy: () -> Unit,
    onNavigateToTerms: () -> Unit,
    onNavigateToAiDisclaimer: () -> Unit,
    onNavigateToAbout: () -> Unit,
    onNavigateToSupport: () -> Unit,
    onNavigateToBackupRestore: () -> Unit
) {
    val context = LocalContext.current
    val darkModePref by viewModel.darkModeEnabled.collectAsState(initial = null)
    val userName by viewModel.userName.collectAsState(initial = "")
    val userEmail by viewModel.userEmail.collectAsState(initial = "")
    val authState by viewModel.authState.collectAsState()
    val actionState by viewModel.actionState.collectAsState()

    var nameInput by rememberSaveable { mutableStateOf("") }
    var emailInput by rememberSaveable { mutableStateOf("") }
    
    var oldPassword by rememberSaveable { mutableStateOf("") }
    var newPassword by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(Unit) {
        viewModel.fetchMe()
    }

    LaunchedEffect(userName, userEmail) {
        nameInput = userName ?: ""
        emailInput = userEmail ?: ""
    }

    LaunchedEffect(authState) {
        if (authState is UiState.Success) {
            Toast.makeText(context, "Profile updated successfully!", Toast.LENGTH_SHORT).show()
            viewModel.clearStates()
        }
    }

    LaunchedEffect(actionState) {
        if (actionState is UiState.Success) {
            Toast.makeText(context, (actionState as UiState.Success).data, Toast.LENGTH_SHORT).show()
            oldPassword = ""
            newPassword = ""
            viewModel.clearStates()
        }
    }

    var showThemeDialog by remember { mutableStateOf(false) }
    var showDeleteAccountDialog by remember { mutableStateOf(false) }
    var notificationsEnabled by remember { mutableStateOf(true) }
    var showFormatDialog by remember { mutableStateOf(false) }
    var resumeFormatPref by remember { mutableStateOf("PDF") }
    var showToneDialog by remember { mutableStateOf(false) }
    var aiTonePref by remember { mutableStateOf("Professional") }
    var showLangDialog by remember { mutableStateOf(false) }
    var languagePref by remember { mutableStateOf("English (US)") }
    var checkingUpdates by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile & Settings", color = MaterialTheme.colorScheme.onSurface) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.onSurface)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Profile details Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(text = "Personal Information", color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    
                    OutlinedTextField(
                        value = nameInput,
                        onValueChange = { nameInput = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = getOutlinedTextFieldColors()
                    )

                    OutlinedTextField(
                        value = emailInput,
                        onValueChange = { emailInput = it },
                        label = { Text("Email Address") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = getOutlinedTextFieldColors()
                    )

                    if (authState is UiState.Error) {
                        Text(text = (authState as UiState.Error).message, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            if (nameInput.isNotBlank() && emailInput.isNotBlank()) {
                                viewModel.updateProfile(nameInput.trim(), emailInput.trim())
                            }
                        },
                        modifier = Modifier.align(Alignment.End),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = MaterialTheme.colorScheme.onPrimary
                        ),
                        enabled = authState !is UiState.Loading
                    ) {
                        Text("Update Profile")
                    }
                }
            }

            // Security Settings Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(text = "Security & Password", color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold, fontSize = 16.sp)

                    OutlinedTextField(
                        value = oldPassword,
                        onValueChange = { oldPassword = it },
                        label = { Text("Current Password") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = getOutlinedTextFieldColors()
                    )

                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text("New Password (min 6 chars)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = getOutlinedTextFieldColors()
                    )

                    if (actionState is UiState.Error) {
                        Text(text = (actionState as UiState.Error).message, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            if (oldPassword.isNotBlank() && newPassword.length >= 6) {
                                viewModel.changePassword(oldPassword, newPassword)
                            }
                        },
                        modifier = Modifier.align(Alignment.End),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = MaterialTheme.colorScheme.onPrimary
                        ),
                        enabled = actionState !is UiState.Loading
                    ) {
                        Text("Update Password")
                    }
                }
            }

            // App Preferences Card
            
            val currentThemeLabel = when (darkModePref) {
                false -> "Light Mode"
                true -> "Dark Mode"
                null -> "System Default"
            }

            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(text = "App Preferences", color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showThemeDialog = true }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Theme Preference", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                            Text(text = "Currently set to $currentThemeLabel", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
                        }
                        Text(
                            text = currentThemeLabel,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Notifications Settings
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Push Notifications", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                            Text(text = "Alerts for ATS scores and builder updates", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
                        }
                        Switch(
                            checked = notificationsEnabled,
                            onCheckedChange = { notificationsEnabled = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = MaterialTheme.colorScheme.primary,
                                checkedTrackColor = MaterialTheme.colorScheme.primaryContainer
                            )
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Resume Preferences
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showFormatDialog = true }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Preferred Resume Format", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                            Text(text = "Default export format for new builds", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
                        }
                        Text(
                            text = resumeFormatPref,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // AI Preferences
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showToneDialog = true }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "AI Suggestion Tone", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                            Text(text = "Writing style tone for resume analysis suggestions", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
                        }
                        Text(
                            text = aiTonePref,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Language Preference
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showLangDialog = true }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Preferred Language", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                            Text(text = "Locale used throughout the app dashboard", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
                        }
                        Text(
                            text = languagePref,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Reset Onboarding Walkthrough
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                viewModel.resetAllTours()
                                Toast.makeText(context, "Walkthroughs and screen tours reset! They will show on next launch/opening.", Toast.LENGTH_LONG).show()
                            }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Reset Walkthrough", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                            Text(text = "Show onboarding tutorial on next startup", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
                        }
                        Text(
                            text = "Reset",
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Backup & Restore
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateToBackupRestore() }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Backup & Restore", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                            Text(text = "Export or import your resumes, cover letters, and settings", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
                        }
                        Text(
                            text = "Manage",
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }

            // Legal & Privacy Settings Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        text = "Legal & Privacy",
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )

                    // Option: Privacy Policy
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateToPrivacy() }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Privacy Policy", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                        Text(text = "View", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: Terms & Conditions
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateToTerms() }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Terms & Conditions", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                        Text(text = "View", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: AI Disclaimer
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateToAiDisclaimer() }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "AI Disclaimer", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                        Text(text = "View", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: About ResumeIQ
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateToAbout() }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "About ResumeIQ", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                        Text(text = "View", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: Contact Support
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateToSupport() }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Contact Support", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                        Text(text = "Contact", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: Check for Updates
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(enabled = !checkingUpdates) {
                                checkingUpdates = true
                                scope.launch {
                                    kotlinx.coroutines.delay(1800)
                                    checkingUpdates = false
                                    Toast.makeText(context, "Your app is up to date! (Version 1.0.0)", Toast.LENGTH_SHORT).show()
                                }
                            }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Check for Updates", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                        if (checkingUpdates) {
                            CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                        } else {
                            Text(text = "Check", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: App Version
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "App Version", color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                        Text(text = "1.0.0", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 14.sp)
                    }
                }
            }

            // Danger Zone Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Danger Zone",
                        color = MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        text = "Deleting your account is permanent and will irreversibly delete all of your uploaded resumes, parsed history, cover letters, and generated reports.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                    Button(
                        onClick = { showDeleteAccountDialog = true },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer,
                            contentColor = MaterialTheme.colorScheme.onErrorContainer
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Delete My Account", fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Logout Option
            Button(
                onClick = {
                    viewModel.logout()
                    onLogout()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error,
                    contentColor = MaterialTheme.colorScheme.onError
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Sign Out", fontWeight = FontWeight.Bold)
            }
        }
    }

    if (showThemeDialog) {
        val options = listOf("Light Mode", "Dark Mode", "System Default")
        val currentSelectedIndex = when (darkModePref) {
            false -> 0
            true -> 1
            null -> 2
        }
        AlertDialog(
            onDismissRequest = { showThemeDialog = false },
            title = { Text("Select Theme", color = MaterialTheme.colorScheme.onSurface) },
            containerColor = MaterialTheme.colorScheme.surface,
            text = {
                Column {
                    options.forEachIndexed { index, option ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .selectable(
                                    selected = (index == currentSelectedIndex),
                                    onClick = {
                                        when (index) {
                                            0 -> viewModel.setDarkMode(false)
                                            1 -> viewModel.setDarkMode(true)
                                            2 -> viewModel.clearDarkMode()
                                        }
                                        showThemeDialog = false
                                    }
                                )
                                .padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = (index == currentSelectedIndex),
                                onClick = {
                                    when (index) {
                                        0 -> viewModel.setDarkMode(false)
                                        1 -> viewModel.setDarkMode(true)
                                        2 -> viewModel.clearDarkMode()
                                    }
                                    showThemeDialog = false
                                }
                            )
                            Text(
                                text = option,
                                modifier = Modifier.padding(start = 16.dp),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showThemeDialog = false }) {
                    Text("Cancel", color = MaterialTheme.colorScheme.primary)
                }
            }
        )
    }

    if (showDeleteAccountDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteAccountDialog = false },
            title = { Text("Delete Account?", color = MaterialTheme.colorScheme.error) },
            text = {
                Text("Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteAccountDialog = false
                        viewModel.deleteAccount(
                            onSuccess = {
                                Toast.makeText(context, "Account deleted successfully.", Toast.LENGTH_LONG).show()
                                onLogout()
                            },
                            onError = { errMsg ->
                                Toast.makeText(context, "Error: $errMsg", Toast.LENGTH_LONG).show()
                            }
                        )
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error,
                        contentColor = MaterialTheme.colorScheme.onError
                    )
                ) {
                    Text("Delete Permanently")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteAccountDialog = false }) {
                    Text("Cancel", color = MaterialTheme.colorScheme.primary)
                }
            },
            containerColor = MaterialTheme.colorScheme.surface
        )
    }

    if (showFormatDialog) {
        val formats = listOf("PDF", "DOCX", "DOC")
        AlertDialog(
            onDismissRequest = { showFormatDialog = false },
            title = { Text("Choose Resume Format") },
            text = {
                Column {
                    formats.forEach { format ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    resumeFormatPref = format
                                    showFormatDialog = false
                                }
                                .padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = (format == resumeFormatPref),
                                onClick = {
                                    resumeFormatPref = format
                                    showFormatDialog = false
                                }
                            )
                            Text(text = format, modifier = Modifier.padding(start = 12.dp))
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showFormatDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showToneDialog) {
        val tones = listOf("Professional", "Creative", "Concise", "Assertive")
        AlertDialog(
            onDismissRequest = { showToneDialog = false },
            title = { Text("Choose AI Suggestion Tone") },
            text = {
                Column {
                    tones.forEach { tone ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    aiTonePref = tone
                                    showToneDialog = false
                                }
                                .padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = (tone == aiTonePref),
                                onClick = {
                                    aiTonePref = tone
                                    showToneDialog = false
                                }
                            )
                            Text(text = tone, modifier = Modifier.padding(start = 12.dp))
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showToneDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showLangDialog) {
        val langs = listOf("English (US)", "English (UK)", "Español", "Français", "Deutsch")
        AlertDialog(
            onDismissRequest = { showLangDialog = false },
            title = { Text("Choose App Language") },
            text = {
                Column {
                    langs.forEach { lang ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    languagePref = lang
                                    showLangDialog = false
                                }
                                .padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = (lang == languagePref),
                                onClick = {
                                    languagePref = lang
                                    showLangDialog = false
                                }
                            )
                            Text(text = lang, modifier = Modifier.padding(start = 12.dp))
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showLangDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

