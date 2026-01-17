package com.example.sudchat.presentation.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Chat : Screen("chat")
}
