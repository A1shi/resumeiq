package com.aashi.resumeiq.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "resumeiq_prefs")

class PreferencesManager(private val context: Context) {

    companion object {
        private val SESSION_TOKEN = stringPreferencesKey("session_token")
        private val USER_EMAIL = stringPreferencesKey("user_email")
        private val USER_NAME = stringPreferencesKey("user_name")
        private val USER_ID = intPreferencesKey("user_id")
        private val IS_VERIFIED = booleanPreferencesKey("is_verified")
        private val DARK_MODE = booleanPreferencesKey("dark_mode")
        private val REMEMBER_ME = booleanPreferencesKey("remember_me")
        private val SESSION_EXPIRED = booleanPreferencesKey("session_expired")
        private val DISCLAIMER_ACCEPTED = booleanPreferencesKey("disclaimer_accepted")
        private val PICKER_EXPLANATION_SHOWN = booleanPreferencesKey("picker_explanation_shown")
        private val ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
        private val DASHBOARD_TOUR_COMPLETED = booleanPreferencesKey("dashboard_tour_completed")
        private val BUILDER_TOUR_COMPLETED = booleanPreferencesKey("builder_tour_completed")
        private val DETAIL_TOUR_COMPLETED = booleanPreferencesKey("detail_tour_completed")
        private val INTERVIEW_TOUR_COMPLETED = booleanPreferencesKey("interview_tour_completed")
    }

    val sessionToken: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[SESSION_TOKEN]
    }

    val userEmail: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[USER_EMAIL]
    }

    val userName: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[USER_NAME]
    }

    val isUserVerified: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[IS_VERIFIED] ?: false
    }

    val darkModeEnabled: Flow<Boolean?> = context.dataStore.data.map { preferences ->
        preferences[DARK_MODE]
    }

    val rememberMe: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[REMEMBER_ME] ?: false
    }

    val sessionExpired: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[SESSION_EXPIRED] ?: false
    }

    val disclaimerAccepted: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[DISCLAIMER_ACCEPTED] ?: false
    }

    val pickerExplanationShown: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[PICKER_EXPLANATION_SHOWN] ?: false
    }

    val onboardingCompleted: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[ONBOARDING_COMPLETED] ?: false
    }

    val dashboardTourCompleted: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[DASHBOARD_TOUR_COMPLETED] ?: false
    }

    val builderTourCompleted: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[BUILDER_TOUR_COMPLETED] ?: false
    }

    val detailTourCompleted: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[DETAIL_TOUR_COMPLETED] ?: false
    }

    val interviewTourCompleted: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[INTERVIEW_TOUR_COMPLETED] ?: false
    }




    suspend fun saveSession(token: String, userId: Int, email: String, name: String, isVerified: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[SESSION_TOKEN] = token
            preferences[USER_ID] = userId
            preferences[USER_EMAIL] = email
            preferences[USER_NAME] = name
            preferences[IS_VERIFIED] = isVerified
        }
    }

    suspend fun updateVerificationStatus(isVerified: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[IS_VERIFIED] = isVerified
        }
    }

    suspend fun updateProfile(email: String, name: String) {
        context.dataStore.edit { preferences ->
            preferences[USER_EMAIL] = email
            preferences[USER_NAME] = name
        }
    }

    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[DARK_MODE] = enabled
        }
    }

    suspend fun clearDarkMode() {
        context.dataStore.edit { preferences ->
            preferences.remove(DARK_MODE)
        }
    }

    suspend fun setRememberMe(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[REMEMBER_ME] = enabled
        }
    }

    suspend fun setSessionExpired(expired: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[SESSION_EXPIRED] = expired
        }
    }

    suspend fun clearSession() {
        context.dataStore.edit { preferences ->
            preferences.remove(SESSION_TOKEN)
            preferences.remove(USER_ID)
            preferences.remove(USER_EMAIL)
            preferences.remove(USER_NAME)
            preferences.remove(IS_VERIFIED)
        }
    }

    suspend fun setDisclaimerAccepted(accepted: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[DISCLAIMER_ACCEPTED] = accepted
        }
    }

    suspend fun setPickerExplanationShown(shown: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PICKER_EXPLANATION_SHOWN] = shown
        }
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[ONBOARDING_COMPLETED] = completed
        }
    }

    suspend fun setDashboardTourCompleted(completed: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[DASHBOARD_TOUR_COMPLETED] = completed
        }
    }

    suspend fun setBuilderTourCompleted(completed: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[BUILDER_TOUR_COMPLETED] = completed
        }
    }

    suspend fun setDetailTourCompleted(completed: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[DETAIL_TOUR_COMPLETED] = completed
        }
    }

    suspend fun setInterviewTourCompleted(completed: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[INTERVIEW_TOUR_COMPLETED] = completed
        }
    }

    suspend fun resetAllTours() {
        context.dataStore.edit { preferences ->
            preferences[ONBOARDING_COMPLETED] = false
            preferences[DASHBOARD_TOUR_COMPLETED] = false
            preferences[BUILDER_TOUR_COMPLETED] = false
            preferences[DETAIL_TOUR_COMPLETED] = false
            preferences[INTERVIEW_TOUR_COMPLETED] = false
        }
    }
}
