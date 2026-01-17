package com.example.sudchat.data.remote.model

import com.google.gson.annotations.SerializedName

// What we send to Login/Register
data class LoginRequest(
    val email: String,
    val pass: String
)

// What we get back (The JWT)
data class AuthResponse(
    val access_token: String
)

// What we send to Chat
data class ChatRequest(
    val message: String,
    val conversationId: String? = null
)

// What we get back from Chat
data class ChatResponse(
    val response: String,
    val conversationId: String
)

// Message History Item
data class MessageDto(
    @SerializedName("_id") val id: String? = null,
    val conversationId: String? = null,
    val userEmail: String? = null,
    val message: String? = null,
    val response: String? = null,
    val aiModel: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

// Conversation Item (Sidebar)
data class ConversationDto(
    @SerializedName("_id") val _id: String,
    val userEmail: String? = null,
    @SerializedName("title") val title: String? = null,
    val lastMessage: String? = null,
    val updatedAt: String? = null
)
