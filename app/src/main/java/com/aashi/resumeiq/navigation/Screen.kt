package com.aashi.resumeiq.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Welcome : Screen("welcome")
    object Login : Screen("login")
    object Register : Screen("register")
    
    object VerifyEmail : Screen("verify_email/{email}") {
        fun createRoute(email: String) = "verify_email/$email"
    }
    
    object ForgotPassword : Screen("forgot_password")
    
    object ResetPassword : Screen("reset_password/{email}") {
        fun createRoute(email: String) = "reset_password/$email"
    }
    
    object Dashboard : Screen("dashboard")
    object History : Screen("history")
    
    object Detail : Screen("detail/{resumeId}") {
        fun createRoute(resumeId: Int) = "detail/$resumeId"
    }
    
    object Match : Screen("match/{resumeId}") {
        fun createRoute(resumeId: Int) = "match/$resumeId"
    }
    
    object Simulation : Screen("simulation/{resumeId}") {
        fun createRoute(resumeId: Int) = "simulation/$resumeId"
    }
    
    object CoverLetter : Screen("cover_letter/{resumeId}") {
        fun createRoute(resumeId: Int) = "cover_letter/$resumeId"
    }

    object Builder : Screen("builder/{resumeId}") {
        fun createRoute(resumeId: Int) = "builder/$resumeId"
    }

    object Templates : Screen("templates/{resumeId}") {
        fun createRoute(resumeId: Int) = "templates/$resumeId"
    }

    object InterviewPrep : Screen("interview_prep/{resumeId}") {
        fun createRoute(resumeId: Int) = "interview_prep/$resumeId"
    }
    
    object Profile : Screen("profile")
    object BackupRestore : Screen("backup_restore")
    
    object PrivacyPolicy : Screen("privacy_policy")
    object TermsConditions : Screen("terms_conditions")
    object AiDisclaimer : Screen("ai_disclaimer")
    object About : Screen("about")
    object ContactSupport : Screen("contact_support")
    object Onboarding : Screen("onboarding")
    object Feedback : Screen("feedback/{category}") {
        fun createRoute(category: String) = "feedback/$category"
    }
}
