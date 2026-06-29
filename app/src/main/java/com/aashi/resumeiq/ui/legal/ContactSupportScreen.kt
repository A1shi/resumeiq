package com.aashi.resumeiq.ui.legal

import android.content.Context
import android.content.ContextWrapper
import android.app.Activity
import com.google.android.play.core.review.ReviewManagerFactory
import androidx.compose.ui.graphics.Color
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContactSupportScreen(
    onNavigateBack: () -> Unit,
    onNavigateToFeedback: (String) -> Unit
) {
    val context = LocalContext.current
    val supportEmail = "aashi9gupta@gmail.com"

    fun Context.findActivity(): Activity? {
        var currentContext = this
        while (currentContext is ContextWrapper) {
            if (currentContext is Activity) {
                return currentContext
            }
            currentContext = currentContext.baseContext
        }
        return null
    }

    fun openPlayStore(context: Context) {
        val rateIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=${context.packageName}"))
        try {
            context.startActivity(rateIntent)
        } catch (e: Exception) {
            val webRateIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=${context.packageName}"))
            try {
                context.startActivity(webRateIntent)
            } catch (ex: Exception) {
                Toast.makeText(context, "Play Store link coming soon!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    fun launchInAppReview(context: Context) {
        val activity = context.findActivity()
        if (activity == null) {
            openPlayStore(context)
            return
        }
        val manager = ReviewManagerFactory.create(context)
        val request = manager.requestReviewFlow()
        request.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val reviewInfo = task.result
                val flow = manager.launchReviewFlow(activity, reviewInfo)
                flow.addOnCompleteListener {
                    // Review flow completed
                }
            } else {
                openPlayStore(context)
            }
        }
    }

    fun sendEmail(subject: String) {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("mailto:")
            putExtra(Intent.EXTRA_EMAIL, arrayOf(supportEmail))
            putExtra(Intent.EXTRA_SUBJECT, subject)
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "No email app found. Please mail us at $supportEmail", Toast.LENGTH_LONG).show()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Contact Support", color = MaterialTheme.colorScheme.onSurface) },
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
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
                        text = "How can we help you?",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "We are dedicated to helping you build the best possible resume. Select an option below to reach out to our team.",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            // Support options list card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    // Option: General support
                    ListItem(
                        headlineContent = { Text("Email Support", fontWeight = FontWeight.SemiBold) },
                        supportingContent = { Text("aashi9gupta@gmail.com") },
                        leadingContent = { Icon(Icons.Default.Email, contentDescription = "Email", tint = MaterialTheme.colorScheme.primary) },
                        modifier = Modifier.clickable { sendEmail("ResumeIQ Support Request") }
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: Report bug
                    ListItem(
                        headlineContent = { Text("Report a Bug", fontWeight = FontWeight.SemiBold) },
                        supportingContent = { Text("Let us know about errors or crashes") },
                        leadingContent = { Icon(Icons.Default.Warning, contentDescription = "Bug", tint = MaterialTheme.colorScheme.error) },
                        modifier = Modifier.clickable { onNavigateToFeedback("Bug Report") }
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: Feature Request
                    ListItem(
                        headlineContent = { Text("Request a Feature", fontWeight = FontWeight.SemiBold) },
                        supportingContent = { Text("Tell us how we can improve ResumeIQ") },
                        leadingContent = { Icon(Icons.Default.Star, contentDescription = "Feature", tint = MaterialTheme.colorScheme.primary) },
                        modifier = Modifier.clickable { onNavigateToFeedback("Feature Request") }
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: General Feedback Form
                    ListItem(
                        headlineContent = { Text("Submit App Feedback", fontWeight = FontWeight.SemiBold) },
                        supportingContent = { Text("Send questions or general thoughts") },
                        leadingContent = { Icon(Icons.Default.Info, contentDescription = "Feedback", tint = MaterialTheme.colorScheme.primary) },
                        modifier = Modifier.clickable { onNavigateToFeedback("General Feedback") }
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: Website
                    ListItem(
                        headlineContent = { Text("Visit Website", fontWeight = FontWeight.SemiBold) },
                        supportingContent = { Text("www.resumeiq.app") },
                        leadingContent = { Icon(Icons.Default.Home, contentDescription = "Website", tint = MaterialTheme.colorScheme.primary) },
                        modifier = Modifier.clickable {
                            val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.resumeiq.app"))
                            try {
                                context.startActivity(webIntent)
                            } catch (e: Exception) {
                                Toast.makeText(context, "Website coming soon!", Toast.LENGTH_SHORT).show()
                            }
                        }
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: Rate App
                    ListItem(
                        headlineContent = { Text("Rate App", fontWeight = FontWeight.SemiBold) },
                        supportingContent = { Text("Support us by leaving a review on the Play Store") },
                        leadingContent = { Icon(Icons.Default.Favorite, contentDescription = "Rate", tint = Color(0xFFE91E63)) },
                        modifier = Modifier.clickable { launchInAppReview(context) }
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                    // Option: Share App
                    ListItem(
                        headlineContent = { Text("Share App", fontWeight = FontWeight.SemiBold) },
                        supportingContent = { Text("Tell your friends about ResumeIQ") },
                        leadingContent = { Icon(Icons.Default.Share, contentDescription = "Share", tint = MaterialTheme.colorScheme.primary) },
                        modifier = Modifier.clickable {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_SUBJECT, "Check out ResumeIQ")
                                putExtra(Intent.EXTRA_TEXT, "Hey! I'm using ResumeIQ to optimize my resume for ATS scoring and prepare for interviews. Download it here: https://play.google.com/store/apps/details?id=${context.packageName}")
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Share ResumeIQ via"))
                        }
                    )
                }
            }
        }
    }
}
