package com.example.sudchat.data.remote

import com.example.sudchat.data.remote.model.*
import retrofit2.http.*

interface ChatApi {

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): AuthResponse

    @POST("auth/register")
    suspend fun register(
        @Body request: LoginRequest
    ): AuthResponse

    @POST("chat/send")
    suspend fun sendMessage(
        @Body request: ChatRequest
    ): ChatResponse

    @GET("chat/conversations")
    suspend fun getConversations(
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 10
    ): List<ConversationDto>

    @GET("chat/conversation/{id}")
    suspend fun getConversationDetails(
        @Path("id") id: String
    ): List<MessageDto>
}
