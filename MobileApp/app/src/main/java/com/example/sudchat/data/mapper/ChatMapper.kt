package com.example.sudchat.data.mapper

import com.example.sudchat.data.remote.model.ConversationDto
import com.example.sudchat.data.remote.model.MessageDto
import com.example.sudchat.domain.model.ChatMessage
import com.example.sudchat.domain.model.Conversation

fun MessageDto.toDomainMessages(): List<ChatMessage> {
    return listOf(
        ChatMessage(text = this.message ?: "", isFromUser = true),
        ChatMessage(text = this.response ?: "", isFromUser = false)
    )
}

fun ConversationDto.toDomain(): Conversation {
    return Conversation(
        id = this._id,
        title = this.title ?: this.lastMessage ?: "New Conversation",
        lastMessage = this.lastMessage ?: "",
        updatedAt = this.updatedAt ?: ""
    )
}