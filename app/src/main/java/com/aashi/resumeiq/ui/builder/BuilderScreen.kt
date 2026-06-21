package com.aashi.resumeiq.ui.builder

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aashi.resumeiq.network.*
import com.aashi.resumeiq.ui.auth.UiState
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun BuilderScreen(
    resumeId: Int,
    viewModel: BuilderViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val saveStatus by viewModel.saveStatus.collectAsState()
    val downloadStatus by viewModel.downloadStatus.collectAsState()

    var selectedTab by rememberSaveable { mutableStateOf(0) }
    var showDownloadMenu by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(resumeId) {
        viewModel.initBuilder(resumeId)
    }

    LaunchedEffect(downloadStatus) {
        when (val status = downloadStatus) {
            is DownloadStatus.Success -> {
                Toast.makeText(context, "PDF downloaded to Downloads folder!", Toast.LENGTH_LONG).show()
                viewModel.resetDownloadStatus()
            }
            is DownloadStatus.Error -> {
                Toast.makeText(context, "Download failed: ${status.message}", Toast.LENGTH_LONG).show()
                viewModel.resetDownloadStatus()
            }
            else -> {}
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Resume Builder", color = MaterialTheme.colorScheme.onSurface, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        SaveStatusIndicator(saveStatus = saveStatus)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.onSurface)
                    }
                },
                actions = {
                    if (uiState is UiState.Success) {
                        Box {
                            TextButton(onClick = { showDownloadMenu = true }) {
                                Text("Export PDF", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                            }
                            DropdownMenu(
                                expanded = showDownloadMenu,
                                onDismissRequest = { showDownloadMenu = false },
                                modifier = Modifier.background(MaterialTheme.colorScheme.surface)
                            ) {
                                val templates = listOf(
                                    "ATS Professional",
                                    "Modern Professional",
                                    "Creative Designer",
                                    "Executive Resume",
                                    "Minimal Elegant",
                                    "Student/Fresher"
                                )
                                templates.forEach { template ->
                                    DropdownMenuItem(
                                        text = { Text(template, color = MaterialTheme.colorScheme.onSurface) },
                                        onClick = {
                                            showDownloadMenu = false
                                            viewModel.downloadPdf(context, template)
                                        }
                                    )
                                }
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = uiState) {
                is UiState.Loading -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Setting up document wizard...", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                    }
                }
                is UiState.Success -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        ScrollableTabRow(
                            selectedTabIndex = selectedTab,
                            containerColor = MaterialTheme.colorScheme.surface,
                            contentColor = MaterialTheme.colorScheme.primary,
                            edgePadding = 16.dp,
                            indicator = { tabPositions ->
                                TabRowDefaults.SecondaryIndicator(
                                    modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        ) {
                            val tabs = listOf("Contact", "Education", "Experience", "Skills", "Projects", "Certs", "Languages")
                            tabs.forEachIndexed { index, title ->
                                Tab(
                                    selected = selectedTab == index,
                                    onClick = { selectedTab = index },
                                    text = { Text(title, color = if (selectedTab == index) MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.6f)) }
                                )
                            }
                        }

                        Box(modifier = Modifier.weight(1f).padding(16.dp)) {
                            when (selectedTab) {
                                0 -> PersonalSection(viewModel = viewModel)
                                1 -> EducationSection(viewModel = viewModel)
                                2 -> ExperienceSection(viewModel = viewModel)
                                3 -> SkillsSection(viewModel = viewModel)
                                4 -> ProjectsSection(viewModel = viewModel)
                                5 -> CertificationsSection(viewModel = viewModel)
                                6 -> LanguagesSection(viewModel = viewModel)
                            }
                        }
                    }
                }
                is UiState.Error -> {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = "Error", tint = Color(0xFFE57373), modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(state.message, color = MaterialTheme.colorScheme.onSurface, textAlign = TextAlign.Center)
                        Spacer(modifier = Modifier.height(24.dp))
                        Button(
                            onClick = { viewModel.initBuilder(resumeId) },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary)
                        ) {
                            Text("Retry Initialization")
                        }
                    }
                }
                else -> {}
            }

            // Downloading PDF Overlay
            if (downloadStatus is DownloadStatus.Downloading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.6f)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Exporting PDF template...", color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
fun SaveStatusIndicator(saveStatus: SaveStatus) {
    val text = when (saveStatus) {
        is SaveStatus.Saving -> "Saving draft..."
        is SaveStatus.Saved -> "All changes saved"
        is SaveStatus.ValidationError -> "Validation issues found"
        is SaveStatus.Error -> "Autosave failed"
        is SaveStatus.Idle -> "Draft version"
    }
    val color = when (saveStatus) {
        is SaveStatus.Saving -> MaterialTheme.colorScheme.primary
        is SaveStatus.Saved -> Color(0xFF81C784)
        is SaveStatus.ValidationError -> MaterialTheme.colorScheme.tertiary
        is SaveStatus.Error -> Color(0xFFE57373)
        is SaveStatus.Idle -> Color.White.copy(alpha = 0.5f)
    }
    Text(text, color = color, fontSize = 11.sp, fontWeight = FontWeight.Medium)
}

@Composable
fun PersonalSection(viewModel: BuilderViewModel) {
    val name by viewModel.name.collectAsState()
    val email by viewModel.email.collectAsState()
    val phone by viewModel.phone.collectAsState()

    val nameError by viewModel.nameError.collectAsState()
    val emailError by viewModel.emailError.collectAsState()
    val phoneError by viewModel.phoneError.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Contact Information", color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text("Provide your current full contact details to populate your header scorecard.", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp)
        }

        item {
            OutlinedTextField(
                value = name,
                onValueChange = {
                    viewModel.name.value = it
                    viewModel.onFieldChanged()
                },
                label = { Text("Full Name") },
                isError = nameError != null,
                supportingText = nameError?.let { { Text(it, color = Color(0xFFE57373)) } },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                modifier = Modifier.fillMaxWidth()
            )
        }

        item {
            OutlinedTextField(
                value = email,
                onValueChange = {
                    viewModel.email.value = it
                    viewModel.onFieldChanged()
                },
                label = { Text("Email Address") },
                isError = emailError != null,
                supportingText = emailError?.let { { Text(it, color = Color(0xFFE57373)) } },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                modifier = Modifier.fillMaxWidth()
            )
        }

        item {
            OutlinedTextField(
                value = phone,
                onValueChange = {
                    viewModel.phone.value = it
                    viewModel.onFieldChanged()
                },
                label = { Text("Phone Number") },
                isError = phoneError != null,
                supportingText = phoneError?.let { { Text(it, color = Color(0xFFE57373)) } },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
fun EducationSection(viewModel: BuilderViewModel) {
    val educationList by viewModel.education.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Education & Credentials", color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Text("Add details of degrees, schools, and majors.", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp)
                }
                Button(
                    onClick = {
                        val updated = educationList.toMutableList().apply {
                            add(EducationSchema(school = "", degree = "", fieldOfStudy = "", startDate = "", endDate = ""))
                        }
                        viewModel.education.value = updated
                        viewModel.onFieldChanged()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        itemsIndexed(educationList) { index, edu ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Education Entry #${index + 1}", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        IconButton(
                            onClick = {
                                val updated = educationList.toMutableList().apply { removeAt(index) }
                                viewModel.education.value = updated
                                viewModel.onFieldChanged()
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFE57373), modifier = Modifier.size(18.dp))
                        }
                    }

                    OutlinedTextField(
                        value = edu.school ?: "",
                        onValueChange = { val newVal = edu.copy(school = it)
                            val updated = educationList.toMutableList().apply { set(index, newVal) }
                            viewModel.education.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("School / University") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = edu.degree ?: "",
                        onValueChange = { val newVal = edu.copy(degree = it)
                            val updated = educationList.toMutableList().apply { set(index, newVal) }
                            viewModel.education.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Degree Earned (e.g. BS, MS)") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = edu.fieldOfStudy ?: "",
                        onValueChange = { val newVal = edu.copy(fieldOfStudy = it)
                            val updated = educationList.toMutableList().apply { set(index, newVal) }
                            viewModel.education.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Field of Study") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = edu.startDate ?: "",
                            onValueChange = { val newVal = edu.copy(startDate = it)
                                val updated = educationList.toMutableList().apply { set(index, newVal) }
                                viewModel.education.value = updated
                                viewModel.onFieldChanged()
                            },
                            label = { Text("Start Date") },
                            colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = edu.endDate ?: "",
                            onValueChange = { val newVal = edu.copy(endDate = it)
                                val updated = educationList.toMutableList().apply { set(index, newVal) }
                                viewModel.education.value = updated
                                viewModel.onFieldChanged()
                            },
                            label = { Text("End Date") },
                            colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ExperienceSection(viewModel: BuilderViewModel) {
    val experienceList by viewModel.experience.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Work Experience", color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Text("Detail your job roles, компании, and impact bullets.", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp)
                }
                Button(
                    onClick = {
                        val updated = experienceList.toMutableList().apply {
                            add(ExperienceSchema(company = "", role = "", startDate = "", endDate = "", description = ""))
                        }
                        viewModel.experience.value = updated
                        viewModel.onFieldChanged()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        itemsIndexed(experienceList) { index, exp ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Role Entry #${index + 1}", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        IconButton(
                            onClick = {
                                val updated = experienceList.toMutableList().apply { removeAt(index) }
                                viewModel.experience.value = updated
                                viewModel.onFieldChanged()
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFE57373), modifier = Modifier.size(18.dp))
                        }
                    }

                    OutlinedTextField(
                        value = exp.company ?: "",
                        onValueChange = { val newVal = exp.copy(company = it)
                            val updated = experienceList.toMutableList().apply { set(index, newVal) }
                            viewModel.experience.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Company Name") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = exp.role ?: "",
                        onValueChange = { val newVal = exp.copy(role = it)
                            val updated = experienceList.toMutableList().apply { set(index, newVal) }
                            viewModel.experience.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Job Title / Role") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = exp.startDate ?: "",
                            onValueChange = { val newVal = exp.copy(startDate = it)
                                val updated = experienceList.toMutableList().apply { set(index, newVal) }
                                viewModel.experience.value = updated
                                viewModel.onFieldChanged()
                            },
                            label = { Text("Start Date") },
                            colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = exp.endDate ?: "",
                            onValueChange = { val newVal = exp.copy(endDate = it)
                                val updated = experienceList.toMutableList().apply { set(index, newVal) }
                                viewModel.experience.value = updated
                                viewModel.onFieldChanged()
                            },
                            label = { Text("End Date") },
                            colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    OutlinedTextField(
                        value = exp.description ?: "",
                        onValueChange = { val newVal = exp.copy(description = it)
                            val updated = experienceList.toMutableList().apply { set(index, newVal) }
                            viewModel.experience.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Description & Achievements") },
                        minLines = 3,
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SkillsSection(viewModel: BuilderViewModel) {
    val skillsList by viewModel.skills.collectAsState()
    var textInput by rememberSaveable { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Skills Toolkit", color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text("Add technical and soft skills. Hit add to register them.", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp)
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = textInput,
                    onValueChange = { textInput = it },
                    label = { Text("Add Skill") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                    modifier = Modifier.weight(1f)
                )
                Button(
                    onClick = {
                        val clean = textInput.trim()
                        if (clean.isNotBlank() && !skillsList.contains(clean)) {
                            val updated = skillsList.toMutableList().apply { add(clean) }
                            viewModel.skills.value = updated
                            viewModel.onFieldChanged()
                            textInput = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(56.dp)
                ) {
                    Text("Add", fontWeight = FontWeight.Bold)
                }
            }
        }

        item {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                skillsList.forEach { skill ->
                    Box(
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                            .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = skill, color = MaterialTheme.colorScheme.onSurface, fontSize = 12.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            IconButton(
                                onClick = {
                                    val updated = skillsList.toMutableList().apply { remove(skill) }
                                    viewModel.skills.value = updated
                                    viewModel.onFieldChanged()
                                },
                                modifier = Modifier.size(16.dp)
                            ) {
                                Icon(Icons.Default.Close, contentDescription = "Remove", tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), modifier = Modifier.size(12.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProjectsSection(viewModel: BuilderViewModel) {
    val projectsList by viewModel.projects.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Projects Portfolio", color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Text("Display key software and side projects.", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp)
                }
                Button(
                    onClick = {
                        val updated = projectsList.toMutableList().apply {
                            add(ProjectSchema(title = "", description = "", technologies = emptyList()))
                        }
                        viewModel.projects.value = updated
                        viewModel.onFieldChanged()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        itemsIndexed(projectsList) { index, proj ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Project #${index + 1}", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        IconButton(
                            onClick = {
                                val updated = projectsList.toMutableList().apply { removeAt(index) }
                                viewModel.projects.value = updated
                                viewModel.onFieldChanged()
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFE57373), modifier = Modifier.size(18.dp))
                        }
                    }

                    OutlinedTextField(
                        value = proj.title ?: "",
                        onValueChange = { val newVal = proj.copy(title = it)
                            val updated = projectsList.toMutableList().apply { set(index, newVal) }
                            viewModel.projects.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Project Title") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = proj.description ?: "",
                        onValueChange = { val newVal = proj.copy(description = it)
                            val updated = projectsList.toMutableList().apply { set(index, newVal) }
                            viewModel.projects.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Description") },
                        minLines = 2,
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    val techInput = proj.technologies.joinToString(", ")
                    OutlinedTextField(
                        value = techInput,
                        onValueChange = {
                            val list = it.split(",").map { item -> item.trim() }.filter { item -> item.isNotEmpty() }
                            val newVal = proj.copy(technologies = list)
                            val updated = projectsList.toMutableList().apply { set(index, newVal) }
                            viewModel.projects.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Technologies (comma separated)") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}

@Composable
fun CertificationsSection(viewModel: BuilderViewModel) {
    val certificationsList by viewModel.certifications.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Upskilling Certifications", color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Text("Add dynamic licenses and certification records.", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp)
                }
                Button(
                    onClick = {
                        val updated = certificationsList.toMutableList().apply {
                            add(CertificationSchema(name = "", issuer = "", date = "", score = ""))
                        }
                        viewModel.certifications.value = updated
                        viewModel.onFieldChanged()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        itemsIndexed(certificationsList) { index, cert ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Certification Entry #${index + 1}", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        IconButton(
                            onClick = {
                                val updated = certificationsList.toMutableList().apply { removeAt(index) }
                                viewModel.certifications.value = updated
                                viewModel.onFieldChanged()
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFE57373), modifier = Modifier.size(18.dp))
                        }
                    }

                    OutlinedTextField(
                        value = cert.name,
                        onValueChange = { val newVal = cert.copy(name = it)
                            val updated = certificationsList.toMutableList().apply { set(index, newVal) }
                            viewModel.certifications.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Certification Name") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = cert.issuer ?: "",
                        onValueChange = { val newVal = cert.copy(issuer = it)
                            val updated = certificationsList.toMutableList().apply { set(index, newVal) }
                            viewModel.certifications.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Issuing Organization") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = cert.date ?: "",
                            onValueChange = { val newVal = cert.copy(date = it)
                                val updated = certificationsList.toMutableList().apply { set(index, newVal) }
                                viewModel.certifications.value = updated
                                viewModel.onFieldChanged()
                            },
                            label = { Text("Date of Issuance") },
                            colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = cert.score ?: "",
                            onValueChange = { val newVal = cert.copy(score = it)
                                val updated = certificationsList.toMutableList().apply { set(index, newVal) }
                                viewModel.certifications.value = updated
                                viewModel.onFieldChanged()
                            },
                            label = { Text("Score / Grade") },
                            colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun LanguagesSection(viewModel: BuilderViewModel) {
    val languagesList by viewModel.languages.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Languages", color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Text("Add foreign and native languages.", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp)
                }
                Button(
                    onClick = {
                        val updated = languagesList.toMutableList().apply {
                            add(LanguageSchema(language = "", proficiency = ""))
                        }
                        viewModel.languages.value = updated
                        viewModel.onFieldChanged()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        itemsIndexed(languagesList) { index, lang ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Language Entry #${index + 1}", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        IconButton(
                            onClick = {
                                val updated = languagesList.toMutableList().apply { removeAt(index) }
                                viewModel.languages.value = updated
                                viewModel.onFieldChanged()
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFE57373), modifier = Modifier.size(18.dp))
                        }
                    }

                    OutlinedTextField(
                        value = lang.language,
                        onValueChange = { val newVal = lang.copy(language = it)
                            val updated = languagesList.toMutableList().apply { set(index, newVal) }
                            viewModel.languages.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Language Name") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = lang.proficiency ?: "",
                        onValueChange = { val newVal = lang.copy(proficiency = it)
                            val updated = languagesList.toMutableList().apply { set(index, newVal) }
                            viewModel.languages.value = updated
                            viewModel.onFieldChanged()
                        },
                        label = { Text("Proficiency (e.g. Native, Fluent, Basic)") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}
