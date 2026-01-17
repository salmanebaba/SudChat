package com.example.sudchat.presentation.auth

import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.sudchat.presentation.chat.ChatViewModel
import com.example.sudchat.presentation.navigation.Screen

@Composable
fun LoginScreen(
    viewModel: ChatViewModel,
    navController: NavController
) {
    val state by viewModel.state
    var isRegisterMode by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    LaunchedEffect(state.isLoggedIn) {
        if (state.isLoggedIn) {
            navController.navigate(Screen.Chat.route) {
                popUpTo(Screen.Login.route) { inclusive = true }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        AnimatedContent(
            targetState = isRegisterMode,
            transitionSpec = {
                fadeIn() togetherWith fadeOut()
            },
            label = "TitleAnimation"
        ) { mode ->
            Text(
                text = if (mode) "Create Account" else "SudChat",
                style = MaterialTheme.typography.headlineLarge
            )
        }

        Spacer(Modifier.height(32.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = {
                if (isRegisterMode) {
                    viewModel.register(email, password)
                } else {
                    viewModel.login(email, password)
                }
            },
            enabled = !state.isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(Modifier.size(24.dp))
            } else {
                Text(if (isRegisterMode) "Register" else "Login")
            }
        }

        TextButton(
            onClick = {
                isRegisterMode = !isRegisterMode
                password = "" // Clear password when switching
            }
        ) {
            Text(if (isRegisterMode) "Already have an account? Login" else "Don't have an account? Register")
        }

        state.error?.let {
            Spacer(Modifier.height(8.dp))
            Text(it, color = MaterialTheme.colorScheme.error)
        }
    }
}
