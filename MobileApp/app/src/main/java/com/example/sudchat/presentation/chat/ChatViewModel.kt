package com.example.sudchat.presentation.chat

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.sudchat.data.repository.AuthRepository
import com.example.sudchat.data.repository.ChatRepository
import com.example.sudchat.data.mapper.toDomain
import com.example.sudchat.data.mapper.toDomainMessages
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val chatRepository: ChatRepository
) : ViewModel() {

    private val _state = mutableStateOf(ChatState())
    val state: State<ChatState> = _state

    init {
        checkAuthStatus()
    }

    private fun checkAuthStatus() {
        viewModelScope.launch {
            val token = authRepository.getToken().first()
            if (!token.isNullOrEmpty()) {
                _state.value = _state.value.copy(isLoggedIn = true)
                loadConversations()
            }
            _state.value = _state.value.copy(isCheckingAuth = false)
        }
    }

    fun loadConversations() {
        viewModelScope.launch {
            val result = chatRepository.getConversations()
            if (result.isSuccess) {
                val conversations = result.getOrNull()?.map { it.toDomain() } ?: emptyList()
                _state.value = _state.value.copy(conversations = conversations)
            } else {
                _state.value = _state.value.copy(error = "Error loading conversations")
            }
        }
    }

    fun selectConversation(id: String) {
        _state.value = _state.value.copy(currentConversationId = id, isLoading = true)
        viewModelScope.launch {
            val result = chatRepository.getConversationDetails(id)
            if (result.isSuccess) {
                val messages = result.getOrNull()?.flatMap { it.toDomainMessages() } ?: emptyList()
                _state.value = _state.value.copy(
                    messages = messages.map { it.text to it.isFromUser }, 
                    isLoading = false
                )
            } else {
                _state.value = _state.value.copy(isLoading = false, error = "Failed to load chat details")
            }
        }
    }

    fun startNewChat() {
        _state.value = _state.value.copy(currentConversationId = null, messages = emptyList())
    }

    fun login(email: String, pass: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            val result = authRepository.login(email, pass)
            if (result.isSuccess) {
                delay(100)
                _state.value = _state.value.copy(isLoggedIn = true, isLoading = false)
                loadConversations()
            } else {
                _state.value = _state.value.copy(isLoading = false, error = "Login failed")
            }
        }
    }

    fun register(email: String, pass: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            val result = authRepository.register(email, pass)
            if (result.isSuccess) {
                delay(200)
                _state.value = _state.value.copy(isLoggedIn = true, isLoading = false)
                loadConversations()
            } else {
                _state.value = _state.value.copy(isLoading = false, error = "Registration failed")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _state.value = ChatState(isCheckingAuth = false) 
        }
    }

    fun sendMessage(text: String) {
        if (text.isBlank()) return

        val currentMessages = _state.value.messages.toMutableList()
        currentMessages.add(text to true)
        _state.value = _state.value.copy(messages = currentMessages, isLoading = true)

        viewModelScope.launch {
            val result = chatRepository.sendMessage(text, _state.value.currentConversationId)
            val updatedMessages = _state.value.messages.toMutableList()
            
            if (result.isSuccess) {
                val response = result.getOrNull()
                updatedMessages.add((response?.response ?: "") to false)
                _state.value = _state.value.copy(
                    messages = updatedMessages,
                    isLoading = false,
                    currentConversationId = response?.conversationId ?: _state.value.currentConversationId
                )
                loadConversations()
            } else {
                updatedMessages.add("Error: ${result.exceptionOrNull()?.message}" to false)
                _state.value = _state.value.copy(messages = updatedMessages, isLoading = false)
            }
        }
    }
}
