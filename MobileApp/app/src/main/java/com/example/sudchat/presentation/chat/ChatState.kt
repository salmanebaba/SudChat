package com.example.sudchat.presentation.chat

import com.example.sudchat.domain.model.Conversation

data class ChatState(
    val messages: List<Pair<String, Boolean>> = emptyList(),
    val conversations: List<Conversation> = emptyList(),
    val currentConversationId: String? = null,
    val isLoading: Boolean = false,
    val isCheckingAuth: Boolean = true,
    val isLoggedIn: Boolean = false,
    val error: String? = null
)