package com.example.sudchat.data.repository

import com.example.sudchat.data.remote.model.ChatResponse
import com.example.sudchat.data.remote.model.ConversationDto
import com.example.sudchat.data.remote.model.MessageDto

interface ChatRepository {
    suspend fun sendMessage(message: String, conversationId: String?): Result<ChatResponse>
    suspend fun getConversations(): Result<List<ConversationDto>>
    suspend fun getConversationDetails(id: String): Result<List<MessageDto>>
}
