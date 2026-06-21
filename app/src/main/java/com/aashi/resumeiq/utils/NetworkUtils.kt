package com.aashi.resumeiq.utils

import com.google.gson.JsonParser
import retrofit2.HttpException
import java.io.IOException
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.net.ssl.SSLException

sealed class AppError(val msg: String, cause: Throwable? = null) : Exception(msg, cause) {
    class NetworkFailure(msg: String, cause: Throwable) : AppError(msg, cause)
    class ValidationError(msg: String, cause: Throwable) : AppError(msg, cause)
    class AuthenticationError(msg: String, cause: Throwable) : AppError(msg, cause)
    class BackendException(msg: String, cause: Throwable) : AppError(msg, cause)
}

fun Throwable.toAppError(): AppError {
    return when (this) {
        is AppError -> this
        is HttpException -> {
            val code = this.code()
            val friendlyMsg = this.toUserFriendlyMessage()
            when (code) {
                401, 403 -> AppError.AuthenticationError(friendlyMsg, this)
                400, 422 -> AppError.ValidationError(friendlyMsg, this)
                else -> AppError.BackendException(friendlyMsg, this)
            }
        }
        is UnknownHostException, is ConnectException, is SocketTimeoutException, is SSLException -> {
            AppError.NetworkFailure(this.toUserFriendlyMessage(), this)
        }
        is IOException -> {
            AppError.NetworkFailure(this.toUserFriendlyMessage(), this)
        }
        else -> {
            AppError.BackendException(this.message ?: "An unexpected error occurred", this)
        }
    }
}

fun Throwable.toUserFriendlyMessage(): String {
    return when (this) {
        is AppError -> this.msg
        is HttpException -> {
            try {
                val errorBody = response()?.errorBody()?.string()
                val requestUrl = response()?.raw()?.request?.url
                val requestMethod = response()?.raw()?.request?.method
                android.util.Log.e("ResumeIQNetwork", "HTTP ${code()} Error on $requestMethod $requestUrl: $errorBody")
                
                if (!errorBody.isNullOrEmpty()) {
                    val jsonElement = JsonParser.parseString(errorBody)
                    if (jsonElement.isJsonObject) {
                        val jsonObject = jsonElement.asJsonObject
                        if (jsonObject.has("detail")) {
                            val detailElement = jsonObject.get("detail")
                            if (detailElement.isJsonPrimitive) {
                                detailElement.asString
                            } else if (detailElement.isJsonArray) {
                                val array = detailElement.asJsonArray
                                val messages = mutableListOf<String>()
                                for (element in array) {
                                    if (element.isJsonPrimitive) {
                                        messages.add(element.asString)
                                    } else if (element.isJsonObject) {
                                        val obj = element.asJsonObject
                                        if (obj.has("msg")) {
                                            messages.add(obj.get("msg").asString)
                                        } else {
                                            messages.add(element.toString())
                                        }
                                    }
                                }
                                messages.joinToString("; ")
                            } else {
                                detailElement.toString()
                            }
                        } else if (jsonObject.has("message")) {
                            jsonObject.get("message").asString
                        } else {
                            "Server error (${code()})"
                        }
                    } else {
                        "Server error (${code()})"
                    }
                } else {
                    "Server error (${code()})"
                }
            } catch (e: Exception) {
                android.util.Log.e("ResumeIQNetwork", "Error parsing HTTP exception body", e)
                "An unexpected server error occurred (${code()})"
            }
        }
        is UnknownHostException -> {
            android.util.Log.e("ResumeIQNetwork", "UnknownHostException: ${this.message}", this)
            "Unknown Host: Cannot resolve server address. Please verify your internet connection and the server IP address."
        }
        is ConnectException -> {
            android.util.Log.e("ResumeIQNetwork", "ConnectException: ${this.message}", this)
            "Connection refused: Could not connect to the server. Please verify the server is running and accessible on your network."
        }
        is SocketTimeoutException -> {
            android.util.Log.e("ResumeIQNetwork", "SocketTimeoutException: ${this.message}", this)
            "Connection timed out: The server took too long to respond. Please check your network quality."
        }
        is SSLException -> {
            android.util.Log.e("ResumeIQNetwork", "SSLException: ${this.message}", this)
            "SSL/TLS handshake failed. Secure connection cannot be established."
        }
        is IOException -> {
            android.util.Log.e("ResumeIQNetwork", "IOException: ${this.javaClass.name}: ${this.message}", this)
            val msg = this.message ?: ""
            if (msg.contains("connect", ignoreCase = true) || msg.contains("timeout", ignoreCase = true) || msg.contains("refused", ignoreCase = true)) {
                "Unable to connect to server: ${this.message}"
            } else {
                "Network failure: ${this.message?.takeIf { it.isNotEmpty() } ?: "No internet connection."}"
            }
        }
        else -> {
            android.util.Log.e("ResumeIQNetwork", "Unknown exception: ${this.javaClass.name}: ${this.message}", this)
            this.message ?: "An unexpected error occurred"
        }
    }
}
