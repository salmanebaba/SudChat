package com.example.sudchat.domain.model

data class ChatMessage(
    val text: String,
    val isFromUser: Boolean
)