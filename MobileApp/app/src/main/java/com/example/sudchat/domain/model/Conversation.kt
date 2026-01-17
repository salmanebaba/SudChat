package com.example.sudchat.domain.model

data class Conversation(
    val id: String,
    val title: String,
    val lastMessage: String,
    val updatedAt: String
)