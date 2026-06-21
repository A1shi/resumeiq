package com.aashi.resumeiq.di

import android.content.Context
import com.aashi.resumeiq.data.PreferencesManager
import com.aashi.resumeiq.network.ResumeIQApiService
import com.aashi.resumeiq.repository.AuthRepository
import com.aashi.resumeiq.repository.ResumeRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun providePreferencesManager(@ApplicationContext context: Context): PreferencesManager {
        return PreferencesManager(context)
    }

    @Provides
    @Singleton
    fun provideAuthRepository(
        apiService: ResumeIQApiService,
        preferencesManager: PreferencesManager
    ): AuthRepository {
        return AuthRepository(apiService, preferencesManager)
    }

    @Provides
    @Singleton
    fun provideResumeRepository(
        apiService: ResumeIQApiService
    ): ResumeRepository {
        return ResumeRepository(apiService)
    }
}
