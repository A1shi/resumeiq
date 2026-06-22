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
}
