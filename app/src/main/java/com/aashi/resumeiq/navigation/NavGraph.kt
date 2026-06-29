package com.aashi.resumeiq.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.aashi.resumeiq.ui.auth.*
import com.aashi.resumeiq.ui.dashboard.DashboardScreen
import com.aashi.resumeiq.ui.detail.DetailScreen
import com.aashi.resumeiq.ui.detail.DetailViewModel
import com.aashi.resumeiq.ui.match.MatchScreen
import com.aashi.resumeiq.ui.profile.ProfileScreen
import com.aashi.resumeiq.ui.simulator.SimulatorScreen
import com.aashi.resumeiq.ui.coverletter.CoverLetterScreen
import com.aashi.resumeiq.ui.builder.BuilderScreen
import com.aashi.resumeiq.ui.builder.BuilderViewModel
import com.aashi.resumeiq.ui.templates.TemplatesScreen
import com.aashi.resumeiq.ui.templates.TemplatesViewModel
import com.aashi.resumeiq.ui.interview.InterviewPrepScreen
import com.aashi.resumeiq.ui.history.HistoryScreen
import com.aashi.resumeiq.ui.legal.*
import com.aashi.resumeiq.ui.backup.BackupRestoreScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel = hiltViewModel(),
    detailViewModel: DetailViewModel = hiltViewModel()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                viewModel = authViewModel,
                onNavigateToDashboard = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToVerify = { email ->
                    navController.navigate(Screen.VerifyEmail.createRoute(email)) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToWelcome = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToOnboarding = {
                    navController.navigate(Screen.Onboarding.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Onboarding.route) {
            OnboardingScreen(
                viewModel = authViewModel,
                onFinishOnboarding = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                },
                onNavigateToPrivacy = { navController.navigate(Screen.PrivacyPolicy.route) },
                onNavigateToTerms = { navController.navigate(Screen.TermsConditions.route) }
            )
        }

        composable(
            route = Screen.Feedback.route,
            arguments = listOf(navArgument("category") { type = NavType.StringType })
        ) { backStackEntry ->
            val category = backStackEntry.arguments?.getString("category") ?: "General Feedback"
            FeedbackScreen(
                viewModel = authViewModel,
                initialCategory = category,
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(Screen.Welcome.route) {
            WelcomeScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) }
            )
        }

        composable(Screen.Login.route) {
            LoginScreen(
                viewModel = authViewModel,
                onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                onNavigateToVerify = { email -> navController.navigate(Screen.VerifyEmail.createRoute(email)) },
                onNavigateToForgotPassword = { navController.navigate(Screen.ForgotPassword.route) },
                onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                viewModel = authViewModel,
                onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                onNavigateToVerify = { email -> navController.navigate(Screen.VerifyEmail.createRoute(email)) }
            )
        }

        composable(
            route = Screen.VerifyEmail.route,
            arguments = listOf(navArgument("email") { type = NavType.StringType })
        ) { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            VerifyScreen(
                email = email,
                viewModel = authViewModel,
                onVerificationSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                viewModel = authViewModel,
                onCodeSent = { email -> navController.navigate(Screen.ResetPassword.createRoute(email)) },
                onNavigateToLogin = { navController.navigate(Screen.Login.route) }
            )
        }

        composable(
            route = Screen.ResetPassword.route,
            arguments = listOf(navArgument("email") { type = NavType.StringType })
        ) { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            ResetPasswordScreen(
                email = email,
                viewModel = authViewModel,
                onResetSuccess = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.ForgotPassword.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                authViewModel = authViewModel,
                detailViewModel = detailViewModel,
                onNavigateToDetail = { resumeId -> navController.navigate(Screen.Detail.createRoute(resumeId)) },
                onNavigateToBuilder = { resumeId -> navController.navigate(Screen.Builder.createRoute(resumeId)) },
                onNavigateToTemplates = { resumeId -> navController.navigate(Screen.Templates.createRoute(resumeId)) },
                onNavigateToProfile = { navController.navigate(Screen.Profile.route) },
                onNavigateToHistory = { navController.navigate(Screen.History.route) },
                onLogout = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = Screen.Detail.route,
            arguments = listOf(navArgument("resumeId") { type = NavType.IntType })
        ) { backStackEntry ->
            val resumeId = backStackEntry.arguments?.getInt("resumeId") ?: -1
            DetailScreen(
                resumeId = resumeId,
                viewModel = detailViewModel,
                authViewModel = authViewModel,
                onNavigateBack = { navController.navigateUp() },
                onNavigateToMatch = { id -> navController.navigate(Screen.Match.createRoute(id)) },
                onNavigateToSim = { id -> navController.navigate(Screen.Simulation.createRoute(id)) },
                onNavigateToCoverLetter = { id -> navController.navigate(Screen.CoverLetter.createRoute(id)) },
                onNavigateToBuilder = { id -> navController.navigate(Screen.Builder.createRoute(id)) },
                onNavigateToTemplates = { id -> navController.navigate(Screen.Templates.createRoute(id)) },
                onNavigateToInterviewPrep = { id -> navController.navigate(Screen.InterviewPrep.createRoute(id)) }
            )
        }

        composable(
            route = Screen.Match.route,
            arguments = listOf(navArgument("resumeId") { type = NavType.IntType })
        ) { backStackEntry ->
            val resumeId = backStackEntry.arguments?.getInt("resumeId") ?: -1
            MatchScreen(
                resumeId = resumeId,
                viewModel = detailViewModel,
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(
            route = Screen.Simulation.route,
            arguments = listOf(navArgument("resumeId") { type = NavType.IntType })
        ) { backStackEntry ->
            val resumeId = backStackEntry.arguments?.getInt("resumeId") ?: -1
            SimulatorScreen(
                resumeId = resumeId,
                viewModel = detailViewModel,
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(
            route = Screen.CoverLetter.route,
            arguments = listOf(navArgument("resumeId") { type = NavType.IntType })
        ) { backStackEntry ->
            val resumeId = backStackEntry.arguments?.getInt("resumeId") ?: -1
            CoverLetterScreen(
                resumeId = resumeId,
                viewModel = detailViewModel,
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(Screen.Profile.route) {
            ProfileScreen(
                viewModel = authViewModel,
                onNavigateBack = { navController.navigateUp() },
                onNavigateToBackupRestore = { navController.navigate(Screen.BackupRestore.route) },
                onLogout = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                },
                onNavigateToPrivacy = { navController.navigate(Screen.PrivacyPolicy.route) },
                onNavigateToTerms = { navController.navigate(Screen.TermsConditions.route) },
                onNavigateToAiDisclaimer = { navController.navigate(Screen.AiDisclaimer.route) },
                onNavigateToAbout = { navController.navigate(Screen.About.route) },
                onNavigateToSupport = { navController.navigate(Screen.ContactSupport.route) }
            )
        }

        composable(Screen.BackupRestore.route) {
            BackupRestoreScreen(
                onNavigateBack = { navController.navigateUp() }
            )
        }


        composable(Screen.PrivacyPolicy.route) {
            PrivacyPolicyScreen(
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(Screen.TermsConditions.route) {
            TermsConditionsScreen(
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(Screen.AiDisclaimer.route) {
            AiDisclaimerScreen(
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(Screen.About.route) {
            AboutScreen(
                onNavigateBack = { navController.navigateUp() },
                onNavigateToPrivacy = { navController.navigate(Screen.PrivacyPolicy.route) },
                onNavigateToTerms = { navController.navigate(Screen.TermsConditions.route) },
                onNavigateToSupport = { navController.navigate(Screen.ContactSupport.route) }
            )
        }

        composable(Screen.ContactSupport.route) {
            ContactSupportScreen(
                onNavigateBack = { navController.navigateUp() },
                onNavigateToFeedback = { category ->
                    navController.navigate(Screen.Feedback.createRoute(category))
                }
            )
        }

        composable(
            route = Screen.Builder.route,
            arguments = listOf(navArgument("resumeId") { type = NavType.IntType })
        ) { backStackEntry ->
            val resumeId = backStackEntry.arguments?.getInt("resumeId") ?: -1
            val builderViewModel: BuilderViewModel = hiltViewModel()
            BuilderScreen(
                resumeId = resumeId,
                viewModel = builderViewModel,
                authViewModel = authViewModel,
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(
            route = Screen.Templates.route,
            arguments = listOf(navArgument("resumeId") { type = NavType.IntType })
        ) { backStackEntry ->
            val resumeId = backStackEntry.arguments?.getInt("resumeId") ?: -1
            val templatesViewModel: TemplatesViewModel = hiltViewModel()
            TemplatesScreen(
                resumeId = resumeId,
                viewModel = templatesViewModel,
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(
            route = Screen.InterviewPrep.route,
            arguments = listOf(navArgument("resumeId") { type = NavType.IntType })
        ) { backStackEntry ->
            val resumeId = backStackEntry.arguments?.getInt("resumeId") ?: -1
            InterviewPrepScreen(
                resumeId = resumeId,
                viewModel = detailViewModel,
                authViewModel = authViewModel,
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(Screen.History.route) {
            HistoryScreen(
                viewModel = detailViewModel,
                onNavigateBack = { navController.navigateUp() },
                onNavigateToDetail = { id -> navController.navigate(Screen.Detail.createRoute(id)) }
            )
        }
    }
}
