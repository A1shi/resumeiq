package com.aashi.resumeiq

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.compose.rememberNavController
import com.aashi.resumeiq.data.PreferencesManager
import com.aashi.resumeiq.navigation.NavGraph
import com.aashi.resumeiq.navigation.Screen
import com.aashi.resumeiq.ui.theme.ResumeIQTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var preferencesManager: PreferencesManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val darkModePref by preferencesManager.darkModeEnabled.collectAsState(initial = null)
            val darkTheme = darkModePref ?: isSystemInDarkTheme()
            val sessionToken by preferencesManager.sessionToken.collectAsState(initial = "")

            ResumeIQTheme(darkTheme = darkTheme) {
                val navController = rememberNavController()

                LaunchedEffect(sessionToken) {
                    if (sessionToken.isNullOrEmpty()) {
                        val currentRoute = navController.currentBackStackEntry?.destination?.route
                        if (currentRoute != null &&
                            currentRoute != Screen.Splash.route &&
                            currentRoute != Screen.Welcome.route &&
                            currentRoute != Screen.Login.route &&
                            currentRoute != Screen.Register.route &&
                            currentRoute != Screen.VerifyEmail.route &&
                            currentRoute != Screen.ForgotPassword.route &&
                            currentRoute != Screen.ResetPassword.route) {
                            
                            navController.navigate(Screen.Welcome.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    }
                }

                NavGraph(navController = navController)
            }
        }
    }
}
