package com.aashi.resumeiq.repository

import com.aashi.resumeiq.data.PreferencesManager
import com.aashi.resumeiq.network.*
import com.aashi.resumeiq.utils.toAppError
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class AuthRepository(
    private val apiService: ResumeIQApiService,
    private val preferencesManager: PreferencesManager
) {

    val sessionToken: Flow<String?> = preferencesManager.sessionToken
    val userName: Flow<String?> = preferencesManager.userName
    val userEmail: Flow<String?> = preferencesManager.userEmail
    val isUserVerified: Flow<Boolean> = preferencesManager.isUserVerified
    val rememberMe: Flow<Boolean> = preferencesManager.rememberMe
    val sessionExpired: Flow<Boolean> = preferencesManager.sessionExpired

    suspend fun setRememberMe(enabled: Boolean) {
        preferencesManager.setRememberMe(enabled)
    }

    suspend fun setSessionExpired(expired: Boolean) {
        preferencesManager.setSessionExpired(expired)
    }

    suspend fun register(userCreate: UserCreate): Result<UserResponse> {
        return try {
            val response = apiService.registerUser(userCreate)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    suspend fun login(userLogin: UserLogin): Result<LoginResponse> {
        return try {
            val response = apiService.loginUser(userLogin)
            // Save session credentials
            preferencesManager.saveSession(
                token = response.accessToken,
                userId = response.user.id,
                email = response.user.email,
                name = response.user.fullName,
                isVerified = response.user.isVerified
            )
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    suspend fun logout(): Result<MessageResponse> {
        return try {
            val response = apiService.logoutUser()
            preferencesManager.clearSession()
            Result.success(response)
        } catch (e: Exception) {
            preferencesManager.clearSession() // fallback to clear local session anyway
            Result.failure(e.toAppError())
        }
    }

    suspend fun verifyEmail(email: String, code: String): Result<LoginResponse> {
        return try {
            val remember = preferencesManager.rememberMe.first()
            val response = apiService.verifyEmail(UserVerify(email, code, remember))
            preferencesManager.saveSession(
                token = response.accessToken,
                userId = response.user.id,
                email = response.user.email,
                name = response.user.fullName,
                isVerified = response.user.isVerified
            )
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    suspend fun resendVerificationCode(email: String): Result<MessageResponse> {
        return try {
            val response = apiService.resendVerification(ForgotPasswordRequest(email))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    suspend fun forgotPassword(email: String): Result<MessageResponse> {
        return try {
            val response = apiService.forgotPassword(ForgotPasswordRequest(email))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    suspend fun resetPassword(request: ResetPasswordRequest): Result<MessageResponse> {
        return try {
            val response = apiService.resetPassword(request)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    suspend fun getMe(): Result<UserResponse> {
        return try {
            val response = apiService.getMe()
            preferencesManager.updateProfile(response.email, response.fullName)
            preferencesManager.updateVerificationStatus(response.isVerified)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    suspend fun updateProfile(fullName: String, email: String): Result<UserResponse> {
        return try {
            val response = apiService.updateProfile(UserUpdate(fullName, email))
            preferencesManager.updateProfile(response.email, response.fullName)
            preferencesManager.updateVerificationStatus(response.isVerified)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    suspend fun changePassword(passwordChange: PasswordChange): Result<MessageResponse> {
        return try {
            val response = apiService.changePassword(passwordChange)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    suspend fun getDashboardStats(): Result<DashboardStatsResponse> {
        return try {
            val response = apiService.getDashboardStats()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }

    val darkModeEnabled: kotlinx.coroutines.flow.Flow<Boolean?> = preferencesManager.darkModeEnabled
    val disclaimerAccepted: kotlinx.coroutines.flow.Flow<Boolean> = preferencesManager.disclaimerAccepted
    val pickerExplanationShown: kotlinx.coroutines.flow.Flow<Boolean> = preferencesManager.pickerExplanationShown
    val onboardingCompleted: kotlinx.coroutines.flow.Flow<Boolean> = preferencesManager.onboardingCompleted
    val dashboardTourCompleted: kotlinx.coroutines.flow.Flow<Boolean> = preferencesManager.dashboardTourCompleted
    val builderTourCompleted: kotlinx.coroutines.flow.Flow<Boolean> = preferencesManager.builderTourCompleted
    val detailTourCompleted: kotlinx.coroutines.flow.Flow<Boolean> = preferencesManager.detailTourCompleted
    val interviewTourCompleted: kotlinx.coroutines.flow.Flow<Boolean> = preferencesManager.interviewTourCompleted

    suspend fun setDarkMode(enabled: Boolean) {
        preferencesManager.setDarkMode(enabled)
    }

    suspend fun clearDarkMode() {
        preferencesManager.clearDarkMode()
    }

    suspend fun setDisclaimerAccepted(accepted: Boolean) {
        preferencesManager.setDisclaimerAccepted(accepted)
    }

    suspend fun setPickerExplanationShown(shown: Boolean) {
        preferencesManager.setPickerExplanationShown(shown)
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        preferencesManager.setOnboardingCompleted(completed)
    }

    suspend fun setDashboardTourCompleted(completed: Boolean) {
        preferencesManager.setDashboardTourCompleted(completed)
    }

    suspend fun setBuilderTourCompleted(completed: Boolean) {
        preferencesManager.setBuilderTourCompleted(completed)
    }

    suspend fun setDetailTourCompleted(completed: Boolean) {
        preferencesManager.setDetailTourCompleted(completed)
    }

    suspend fun setInterviewTourCompleted(completed: Boolean) {
        preferencesManager.setInterviewTourCompleted(completed)
    }

    suspend fun resetAllTours() {
        preferencesManager.resetAllTours()
    }

    suspend fun deleteAccount(): Result<MessageResponse> {
        return try {
            val response = apiService.deleteAccount()
            preferencesManager.clearSession()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e.toAppError())
        }
    }
}
