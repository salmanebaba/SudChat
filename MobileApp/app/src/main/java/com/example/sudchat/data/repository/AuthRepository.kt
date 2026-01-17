package com.example.sudchat.data.repository

import com.example.sudchat.data.local.TokenManager
import com.example.sudchat.data.remote.ChatApi
import com.example.sudchat.data.remote.model.LoginRequest
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class AuthRepository @Inject constructor(
    private val api: ChatApi,
    private val tokenManager: TokenManager
) {
    fun getToken(): Flow<String?> = tokenManager.token

    suspend fun login(email: String, pass: String): Result<Boolean> {
        return try {
            val response = api.login(LoginRequest(email, pass))
            tokenManager.saveToken(response.access_token)
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(email: String, pass: String): Result<Boolean> {
        return try {
            // First, register the user
            api.register(LoginRequest(email, pass))
            
            // Then, immediately login to get a fresh token
            val loginResponse = api.login(LoginRequest(email, pass))
            tokenManager.saveToken(loginResponse.access_token)
            
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        tokenManager.clearToken()
    }
}
