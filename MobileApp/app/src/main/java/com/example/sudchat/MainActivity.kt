package com.example.sudchat

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.sudchat.presentation.auth.LoginScreen
import com.example.sudchat.presentation.chat.ChatScreen
import com.example.sudchat.presentation.chat.ChatViewModel
import com.example.sudchat.presentation.navigation.Screen
import com.example.sudchat.ui.theme.SudChatTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SudChatTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    val chatViewModel: ChatViewModel = hiltViewModel()

                    NavHost(
                        navController = navController,
                        startDestination = Screen.Login.route
                    ) {
                        composable(Screen.Login.route) {
                            LoginScreen(
                                viewModel = chatViewModel,
                                navController = navController
                            )
                        }
                        composable(Screen.Chat.route) {
                            ChatScreen(
                                viewModel = chatViewModel,
                                navController = navController
                            )
                        }
                    }
                }
            }
        }
    }
}
