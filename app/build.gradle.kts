plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.aashi.resumeiq"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.aashi.resumeiq"
        minSdk = 26
        targetSdk = 35
        versionCode = 3
        versionName = "1.2"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../release.keystore")
            storePassword = "password"
            keyAlias = "releaseKey"
            keyPassword = "password"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)

    // Jetpack Compose BOM & UI Libraries
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.navigation.compose)

    // Hilt Dependency Injection
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // Retrofit & OkHttp
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)

    // DataStore Preferences
    implementation(libs.androidx.datastore.preferences)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    debugImplementation(libs.androidx.compose.ui.tooling)
}

tasks.register("copyReleaseOutputs") {
    val version = android.defaultConfig.versionName ?: "1.2"
    val projectDir = rootProject.projectDir
    val buildDirFile = layout.buildDirectory
    
    doLast {
        val releaseDir = File(projectDir, "release")
        if (releaseDir.exists()) {
            releaseDir.deleteRecursively()
        }
        releaseDir.mkdirs()
        
        val buildDir = buildDirFile.get().asFile
        val apkFile = File(buildDir, "outputs/apk/release/app-release.apk")
        val aabFile = File(buildDir, "outputs/bundle/release/app-release.aab")
        
        if (apkFile.exists()) {
            apkFile.copyTo(File(releaseDir, "ResumeIQ-v${version}-release.apk"), overwrite = true)
            println("Copied APK to ${releaseDir}/ResumeIQ-v${version}-release.apk")
        }
        if (aabFile.exists()) {
            aabFile.copyTo(File(releaseDir, "ResumeIQ-v${version}-release.aab"), overwrite = true)
            println("Copied AAB to ${releaseDir}/ResumeIQ-v${version}-release.aab")
        }
    }
}