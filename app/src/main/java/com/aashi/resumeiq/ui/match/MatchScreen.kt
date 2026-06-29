package com.aashi.resumeiq.ui.match

import com.aashi.resumeiq.ui.theme.getOutlinedTextFieldColors

import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aashi.resumeiq.network.*
import com.aashi.resumeiq.ui.auth.UiState
import com.aashi.resumeiq.ui.detail.DetailViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MatchScreen(
    resumeId: Int,
    viewModel: DetailViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val contentResolver = context.contentResolver
    
    var jdText by rememberSaveable { mutableStateOf("") }
    val matchState by viewModel.matchState.collectAsState()
    val jdUploadState by viewModel.jdUploadState.collectAsState()

    val pickerMimeTypes = arrayOf(
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    )

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let { selectedUri ->
            var filename = "job_description.txt"
            contentResolver.query(selectedUri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (cursor.moveToFirst() && nameIndex != -1) {
                    filename = cursor.getString(nameIndex)
                }
            }
            try {
                contentResolver.openInputStream(selectedUri)?.use { stream ->
                    val bytes = stream.readBytes()
                    viewModel.uploadJD(filename, bytes)
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Failed to read file: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
            }
        }
    }

    LaunchedEffect(resumeId) {
        viewModel.clearMatchAndSimStates()
    }

    LaunchedEffect(jdUploadState) {
        if (jdUploadState is UiState.Success) {
            val res = (jdUploadState as UiState.Success).data
            jdText = res.jdText
            viewModel.clearJdUploadState()
            Toast.makeText(context, "Job Description file parsed successfully!", Toast.LENGTH_SHORT).show()
        } else if (jdUploadState is UiState.Error) {
            val errMsg = (jdUploadState as UiState.Error).message
            Toast.makeText(context, errMsg, Toast.LENGTH_LONG).show()
            viewModel.clearJdUploadState()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Compare Job Description", color = MaterialTheme.colorScheme.onSurface) },
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
            when (val state = matchState) {
                is UiState.Idle -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Paste or upload target Job Description",
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                fontSize = 14.sp,
                                modifier = Modifier.weight(1f)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Button(
                                onClick = { filePickerLauncher.launch(pickerMimeTypes) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.surface,
                                    contentColor = MaterialTheme.colorScheme.primary
                                ),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = "Upload",
                                    modifier = Modifier.size(16.dp),
                                    tint = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Upload File", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }

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
                                    viewModel.matchWithJD(resumeId, jdText.trim())
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
                            Text("Compare & Match", fontSize = 16.sp, fontWeight = FontWeight.Bold)
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
                    MatchResultView(match = state.data)
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

            if (jdUploadState is UiState.Loading) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Black.copy(alpha = 0.7f),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(text = "Extracting JD text...", color = MaterialTheme.colorScheme.onSurface)
                    }
                }
            }
        }
    }
}

data class KeywordAnalysisItem(
    val name: String,
    val matched: Boolean,
    val priority: String
)

@Composable
fun AlignProgressBar(label: String, progressPercent: Int, color: Color) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = label, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Text(text = "$progressPercent%", color = MaterialTheme.colorScheme.onSurface, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(4.dp))
        LinearProgressIndicator(
            progress = { progressPercent / 100f },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp),
            color = color,
            trackColor = Color.White.copy(alpha = 0.1f),
            strokeCap = StrokeCap.Round
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MatchResultView(match: JDMatchResponse) {
    val scoreColor = when {
        match.matchScore >= 70 -> Color(0xFF4CAF50)
        match.matchScore >= 50 -> Color(0xFFFFC107)
        else -> Color(0xFFF44336)
    }

    val context = LocalContext.current

    // Compute metrics
    val totalKeywords = match.matchingKeywords.size + match.missingKeywords.size
    val keywordRate = if (totalKeywords > 0) java.lang.Math.round((match.matchingKeywords.size.toFloat() / totalKeywords) * 100) else 100

    val gapLower = match.experienceMatch?.gapAnalysis?.lowercase() ?: ""
    val experienceRate = when {
        gapLower.contains("deficit") || gapLower.contains("deviation") || gapLower.contains("missing") || gapLower.contains("fewer") -> 50
        gapLower.contains("meet") || gapLower.contains("stable") || gapLower.contains("match") || gapLower.contains("align") -> 100
        else -> 75
    }

    val reqCerts = match.certificationMatch?.requiredCertifications ?: emptyList()
    val detCerts = match.certificationMatch?.detectedCertifications ?: emptyList()
    val isCertEmpty = reqCerts.isEmpty() || reqCerts.firstOrNull()?.lowercase()?.contains("no explicit") == true || reqCerts.firstOrNull()?.lowercase()?.contains("none") == true
    val certRate = if (!isCertEmpty) {
        val matchedCertsCount = reqCerts.count { rc -> detCerts.any { dc -> dc.contains(rc, ignoreCase = true) || rc.contains(dc, ignoreCase = true) } }
        java.lang.Math.round((matchedCertsCount.toFloat() / reqCerts.size) * 100)
    } else {
        100
    }

    val keywordAnalysisList = remember(match) {
        val list = mutableListOf<KeywordAnalysisItem>()
        match.matchingKeywords.forEach { kw ->
            list.add(KeywordAnalysisItem(kw, true, "Matched"))
        }
        match.missingKeywords.forEach { kw ->
            val isHigh = match.mostImportantMissingKeywords.any { ikw ->
                ikw.contains(kw, ignoreCase = true) || kw.contains(ikw, ignoreCase = true)
            }
            list.add(KeywordAnalysisItem(kw, false, if (isHigh) "High" else "Medium"))
        }
        list
    }

    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        // Dial & Progress Alignment Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .background(scoreColor.copy(alpha = 0.08f), CircleShape)
                                .border(3.dp, scoreColor, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${match.matchScore}%",
                                color = scoreColor,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Black
                            )
                        }

                        Spacer(modifier = Modifier.width(20.dp))

                        Column {
                            Text(
                                text = match.jobTitle ?: "Target Job Role",
                                color = MaterialTheme.colorScheme.onSurface,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = when {
                                    match.matchScore >= 80 -> "Excellent Match"
                                    match.matchScore >= 60 -> "Good Match"
                                    match.matchScore >= 40 -> "Average Match"
                                    else -> "Poor Match"
                                },
                                color = scoreColor,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Progress indicators
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        AlignProgressBar(label = "Skills Match Rate", progressPercent = keywordRate, color = Color(0xFF4F46E5))
                        AlignProgressBar(label = "Experience Alignment", progressPercent = experienceRate, color = Color(0xFF10B981))
                        AlignProgressBar(label = "Certification Alignment", progressPercent = certRate, color = Color(0xFFF59E0B))
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = {
                            val intent = android.content.Intent(
                                android.content.Intent.ACTION_VIEW,
                                Uri.parse("https://resumeiq-xga7.onrender.com/api/v1/resumes/${match.resumeId}/matches/${match.id}/export-pdf")
                            )
                            context.startActivity(intent)
                        },
                        modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Export",
                            modifier = Modifier.size(18.dp),
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Export Report PDF", color = MaterialTheme.colorScheme.onPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Detailed Keyword & Skill Analysis Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Detailed Keyword & Skill Analysis",
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    if (keywordAnalysisList.isNotEmpty()) {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = "Keyword / Skill",
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.weight(1.5f)
                                )
                                Text(
                                    text = "Status",
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.weight(1f)
                                )
                                Text(
                                    text = "Priority",
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
                            keywordAnalysisList.forEach { item ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = item.name,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        modifier = Modifier.weight(1.5f)
                                    )
                                    Text(
                                        text = if (item.matched) "✓ Matched" else "✗ Missing",
                                        color = if (item.matched) {
                                            if (androidx.compose.foundation.isSystemInDarkTheme()) Color(0xFF81C784) else Color(0xFF2E7D32)
                                        } else {
                                            if (androidx.compose.foundation.isSystemInDarkTheme()) Color(0xFFE57373) else Color(0xFFC62828)
                                        },
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .background(
                                                color = when (item.priority) {
                                                    "Matched" -> Color(0xFF1B3B24).copy(alpha = 0.5f)
                                                    "High" -> Color(0xFF421E1E).copy(alpha = 0.5f)
                                                    else -> Color(0xFF3E301F).copy(alpha = 0.5f)
                                                },
                                                shape = RoundedCornerShape(4.dp)
                                            )
                                            .padding(horizontal = 6.dp, vertical = 2.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = item.priority,
                                            color = when (item.priority) {
                                                "Matched" -> Color(0xFFC8E6C9)
                                                "High" -> Color(0xFFFFCDD2)
                                                else -> Color(0xFFFFE0B2)
                                            },
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    } else {
                        Text(
                            text = "No keywords detected.",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            fontSize = 13.sp,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                        )
                    }
                }
            }
        }

        // Resume Improvement Checklist
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Resume Improvement Checklist",
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Follow these target recommendations to enhance your compatibility index:",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                        fontSize = 12.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    if (match.recommendations.isNotEmpty()) {
                        match.recommendations.forEachIndexed { idx, rec ->
                            var checked by rememberSaveable(key = rec) { mutableStateOf(false) }
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Checkbox(
                                    checked = checked,
                                    onCheckedChange = { checked = it },
                                    colors = CheckboxDefaults.colors(
                                        checkedColor = MaterialTheme.colorScheme.primary,
                                        uncheckedColor = Color.White.copy(alpha = 0.5f)
                                    ),
                                    modifier = Modifier.size(24.dp)
                                )
                                Text(
                                    text = rec,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f),
                                    fontSize = 13.sp,
                                    lineHeight = 18.sp,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }
                    } else {
                        Text(
                            text = "No recommendations computed.",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            fontSize = 13.sp,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                        )
                    }
                }
            }
        }

        // Experience Alignment Card
        if (match.experienceMatch != null) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "Domain Experience Alignment",
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = "Required Experience", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(text = match.experienceMatch.requiredExperience.ifEmpty { "N/A" }, color = MaterialTheme.colorScheme.onSurface, fontSize = 13.sp)
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = "Detected Experience", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(text = match.experienceMatch.detectedExperience.ifEmpty { "N/A" }, color = MaterialTheme.colorScheme.onSurface, fontSize = 13.sp)
                            }
                        }
                        HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
                        Column {
                            Text(text = "Gap Analysis", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(text = match.experienceMatch.gapAnalysis.ifEmpty { "N/A" }, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f), fontSize = 13.sp, lineHeight = 18.sp)
                        }
                    }
                }
            }
        }

        // Certification Alignment Card
        if (match.certificationMatch != null) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "Upskilling & Certification Alignments",
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        Column {
                            Text(text = "Required/Preferred", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(2.dp))
                            if (match.certificationMatch.requiredCertifications.isNotEmpty()) {
                                match.certificationMatch.requiredCertifications.forEach { c ->
                                    Text(text = "• $c", color = MaterialTheme.colorScheme.onSurface, fontSize = 13.sp)
                                }
                            } else {
                                Text(text = "None specified", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 13.sp)
                            }
                        }
                        HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
                        Column {
                            Text(text = "Detected Certifications", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(2.dp))
                            if (match.certificationMatch.detectedCertifications.isNotEmpty()) {
                                match.certificationMatch.detectedCertifications.forEach { c ->
                                    Text(text = "• $c", color = MaterialTheme.colorScheme.onSurface, fontSize = 13.sp)
                                }
                            } else {
                                Text(text = "None detected", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 13.sp)
                            }
                        }
                        HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
                        Column {
                             Text(text = "Missing Certifications", color = if (androidx.compose.foundation.isSystemInDarkTheme()) Color(0xFFE57373) else Color(0xFFC62828), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                             Spacer(modifier = Modifier.height(2.dp))
                             if (match.certificationMatch.missingCertifications.isNotEmpty()) {
                                 match.certificationMatch.missingCertifications.forEach { c ->
                                     Text(text = "• $c", color = if (androidx.compose.foundation.isSystemInDarkTheme()) Color(0xFFFFCDD2) else Color(0xFFC62828), fontSize = 13.sp)
                                 }
                            } else {
                                Text(text = "None missing", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }

        // Practice Q&As
        if (match.interviewQuestions.isNotEmpty()) {
            item {
                Text(text = "JD Interview Q&As", color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }

            items(match.interviewQuestions) { item ->
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
                            Box(
                                modifier = Modifier
                                    .background(
                                        when (item.difficulty.lowercase()) {
                                            "easy" -> Color(0xFF1B3B24)
                                            "medium" -> Color(0xFF3E301F)
                                            else -> Color(0xFF421E1E)
                                        },
                                        RoundedCornerShape(6.dp)
                                    )
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = item.difficulty,
                                    color = when (item.difficulty.lowercase()) {
                                        "easy" -> Color(0xFFC8E6C9)
                                        "medium" -> Color(0xFFFFE0B2)
                                        else -> Color(0xFFFFCDD2)
                                    },
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        
                        Text(
                            text = item.question,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            lineHeight = 20.sp
                        )

                        if (!item.sampleAnswerStructure.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(text = "Answer Guideline", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = item.sampleAnswerStructure ?: "",
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                fontSize = 12.sp,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
