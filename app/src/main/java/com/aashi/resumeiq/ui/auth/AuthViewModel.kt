package com.aashi.resumeiq.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aashi.resumeiq.network.*
import com.aashi.resumeiq.repository.AuthRepository
import com.aashi.resumeiq.utils.AppError
import com.aashi.resumeiq.utils.toAppError
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class ErrorType {
    NETWORK_FAILURE,
    VALIDATION_ERROR,
    AUTHENTICATION_ERROR,
    BACKEND_EXCEPTION,
    UNKNOWN
}

sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<out T>(val data: T) : UiState<T>()
    data class Error(val message: String, val errorType: ErrorType = ErrorType.UNKNOWN) : UiState<Nothing>()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    val userName = authRepository.userName
    val userEmail = authRepository.userEmail
    val isUserVerified = authRepository.isUserVerified
    val isLoggedIn = authRepository.sessionToken

    private val _authState = MutableStateFlow<UiState<UserResponse>>(UiState.Idle)
    val authState: StateFlow<UiState<UserResponse>> = _authState.asStateFlow()

    private val _loginState = MutableStateFlow<UiState<LoginResponse>>(UiState.Idle)
    val loginState: StateFlow<UiState<LoginResponse>> = _loginState.asStateFlow()

    private val _actionState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val actionState: StateFlow<UiState<String>> = _actionState.asStateFlow()

    private val _statsState = MutableStateFlow<UiState<DashboardStatsResponse>>(UiState.Idle)
    val statsState: StateFlow<UiState<DashboardStatsResponse>> = _statsState.asStateFlow()

    fun clearStates() {
        _authState.value = UiState.Idle
        _loginState.value = UiState.Idle
        _actionState.value = UiState.Idle
    }

    private fun Throwable.toUiError(): UiState.Error {
        val appError = this as? AppError ?: this.toAppError()
        val type = when (appError) {
            is AppError.NetworkFailure -> ErrorType.NETWORK_FAILURE
            is AppError.ValidationError -> ErrorType.VALIDATION_ERROR
            is AppError.AuthenticationError -> ErrorType.AUTHENTICATION_ERROR
            is AppError.BackendException -> ErrorType.BACKEND_EXCEPTION
        }
        return UiState.Error(appError.msg, type)
    }

    fun validateSession(onSuccess: (isVerified: Boolean) -> Unit, onError: (isOffline: Boolean) -> Unit) {
        viewModelScope.launch {
            authRepository.getMe()
                .onSuccess { userResponse ->
                    onSuccess(userResponse.isVerified)
                }
                .onFailure { throwable ->
                    val isOffline = throwable is AppError.NetworkFailure || throwable is java.io.IOException
                    onError(isOffline)
                }
        }
    }

    fun register(fullName: String, email: String, pass: String) {
        viewModelScope.launch {
            _authState.value = UiState.Loading
            authRepository.register(UserCreate(email, fullName, pass))
                .onSuccess { _authState.value = UiState.Success(it) }
                .onFailure { _authState.value = it.toUiError() }
        }
    }

    fun login(email: String, pass: String) {
        viewModelScope.launch {
            _loginState.value = UiState.Loading
            authRepository.login(UserLogin(email, pass))
                .onSuccess { _loginState.value = UiState.Success(it) }
                .onFailure { _loginState.value = it.toUiError() }
        }
    }

    fun verifyEmail(email: String, code: String) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            authRepository.verifyEmail(email, code)
                .onSuccess { _actionState.value = UiState.Success("Email verified successfully") }
                .onFailure { _actionState.value = it.toUiError() }
        }
    }

    fun resendCode(email: String) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            authRepository.resendVerificationCode(email)
                .onSuccess { _actionState.value = UiState.Success("Code sent successfully") }
                .onFailure { _actionState.value = it.toUiError() }
        }
    }

    fun forgotPassword(email: String) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            authRepository.forgotPassword(email)
                .onSuccess { _actionState.value = UiState.Success("Password reset instructions sent") }
                .onFailure { _actionState.value = it.toUiError() }
        }
    }

    fun resetPassword(email: String, token: String, newPass: String) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            authRepository.resetPassword(ResetPasswordRequest(email, token, newPass))
                .onSuccess { _actionState.value = UiState.Success("Password reset successfully") }
                .onFailure { _actionState.value = it.toUiError() }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            clearStates()
        }
    }

    fun fetchMe() {
        viewModelScope.launch {
            authRepository.getMe()
        }
    }

    fun updateProfile(fullName: String, email: String) {
        viewModelScope.launch {
            _authState.value = UiState.Loading
            authRepository.updateProfile(fullName, email)
                .onSuccess { _authState.value = UiState.Success(it) }
                .onFailure { _authState.value = it.toUiError() }
        }
    }

    fun changePassword(oldPass: String, newPass: String) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            authRepository.changePassword(PasswordChange(oldPass, newPass))
                .onSuccess { _actionState.value = UiState.Success("Password changed successfully") }
                .onFailure { _actionState.value = it.toUiError() }
        }
    }

    fun fetchStats() {
        viewModelScope.launch {
            _statsState.value = UiState.Loading
            authRepository.getDashboardStats()
                .onSuccess { _statsState.value = UiState.Success(it) }
                .onFailure { _statsState.value = it.toUiError() }
        }
    }

    val darkModeEnabled = authRepository.darkModeEnabled

    fun setDarkMode(enabled: Boolean) {
        viewModelScope.launch {
            authRepository.setDarkMode(enabled)
        }
    }

    fun clearDarkMode() {
        viewModelScope.launch {
            authRepository.clearDarkMode()
        }
    }
}
