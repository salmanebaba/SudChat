package com.example.sudchat.data.repository

import com.example.sudchat.data.remote.ChatApi
import com.example.sudchat.data.remote.model.*
import javax.inject.Inject

class ChatRepositoryImpl @Inject constructor(
    private val api: ChatApi
) : ChatRepository {
    override suspend fun sendMessage(message: String, conversationId: String?): Result<ChatResponse> {
        return try {
            val response = api.sendMessage(ChatRequest(message, conversationId))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getConversations(): Result<List<ConversationDto>> {
        return try {
            val response = api.getConversations()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getConversationDetails(id: String): Result<List<MessageDto>> {
        return try {
            val response = api.getConversationDetails(id)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
