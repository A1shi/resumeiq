package com.aashi.resumeiq.di

import android.content.Context
import com.aashi.resumeiq.data.PreferencesManager
import com.aashi.resumeiq.network.ResumeIQApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton
import javax.inject.Qualifier

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class AuthInterceptor

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class ResponseInterceptor

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class DetailLoggingInterceptor

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class RenderRetryInterceptor

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private const val BASE_URL = "https://resumeiq-xga7.onrender.com/api/v1/"

    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    @Provides
    @Singleton
    @AuthInterceptor
    fun provideAuthInterceptor(preferencesManager: PreferencesManager): Interceptor {
        return Interceptor { chain ->
            val originalRequest = chain.request()
            val token = runBlocking {
                preferencesManager.sessionToken.first()
            }
            val newRequest = if (!token.isNullOrEmpty()) {
                originalRequest.newBuilder()
                    .header("Authorization", "Bearer $token")
                    .build()
            } else {
                originalRequest
            }
            chain.proceed(newRequest)
        }
    }

    @Provides
    @Singleton
    @ResponseInterceptor
    fun provideResponseInterceptor(preferencesManager: PreferencesManager): Interceptor {
        return Interceptor { chain ->
            val request = chain.request()
            val response = chain.proceed(request)
            if (response.code == 401) {
                runBlocking {
                    preferencesManager.clearSession()
                    preferencesManager.setSessionExpired(true)
                }
            }
            response
        }
    }

    @Provides
    @Singleton
    @DetailLoggingInterceptor
    fun provideDetailLoggingInterceptor(): Interceptor {
        return Interceptor { chain ->
            val request = chain.request()
            val url = request.url.toString()
            val method = request.method
            
            val requestBody = request.body
            var requestBodyString = ""
            if (requestBody != null) {
                try {
                    val buffer = okio.Buffer()
                    requestBody.writeTo(buffer)
                    requestBodyString = buffer.readUtf8()
                } catch (e: Exception) {
                    requestBodyString = "(error reading body: ${e.message})"
                }
            }
            
            android.util.Log.d("ResumeIQNetwork", "--> SENDING REQUEST: $method $url")
            if (requestBodyString.isNotEmpty()) {
                android.util.Log.d("ResumeIQNetwork", "Request Body: $requestBodyString")
            }
            
            try {
                val response = chain.proceed(request)
                val code = response.code
                android.util.Log.d("ResumeIQNetwork", "<-- RECEIVED RESPONSE ($code) for $method $url")
                
                val responseBody = response.peekBody(Long.MAX_VALUE)
                val bodyString = responseBody.string()
                android.util.Log.d("ResumeIQNetwork", "Response Body: $bodyString")
                
                response
            } catch (e: Exception) {
                android.util.Log.e("ResumeIQNetwork", "FAILED to execute request: $method $url due to ${e.javaClass.name}: ${e.message}", e)
                throw e
            }
        }
    }

    @Provides
    @Singleton
    @RenderRetryInterceptor
    fun provideRenderRetryInterceptor(): Interceptor {
        return Interceptor { chain ->
            val request = chain.request()
            var response: okhttp3.Response? = null
            var exception: java.io.IOException? = null
            var tryCount = 0
            val maxLimit = 3
            
            while (tryCount < maxLimit) {
                try {
                    response = chain.proceed(request)
                    if (response.isSuccessful || response.code in 400..499) {
                        break
                    }
                    if (tryCount < maxLimit - 1) {
                        response.close()
                        Thread.sleep(2000L * (tryCount + 1))
                    }
                } catch (e: java.io.IOException) {
                    exception = e
                    if (tryCount < maxLimit - 1) {
                        Thread.sleep(2000L * (tryCount + 1))
                    }
                }
                tryCount++
            }
            
            if (response != null) {
                response
            } else if (exception != null) {
                throw exception
            } else {
                throw java.io.IOException("Unknown network error during retry")
            }
        }
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        loggingInterceptor: HttpLoggingInterceptor,
        @AuthInterceptor authInterceptor: Interceptor,
        @ResponseInterceptor responseInterceptor: Interceptor,
        @DetailLoggingInterceptor detailLoggingInterceptor: Interceptor,
        @RenderRetryInterceptor renderRetryInterceptor: Interceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
            .writeTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
            .addInterceptor(renderRetryInterceptor)
            .addInterceptor(authInterceptor)
            .addInterceptor(responseInterceptor)
            .addInterceptor(detailLoggingInterceptor)
            .addInterceptor(loggingInterceptor)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ResumeIQApiService {
        return retrofit.create(ResumeIQApiService::class.java)
    }
}
