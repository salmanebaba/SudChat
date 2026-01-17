# SudChat - Guide de démarrage

Ce projet comprend un backend NestJS (API REST), une application mobile Android (Kotlin/Jetpack Compose) et l'intégration d'agents IA via Ollama.

## Prérequis
- Node.js (>= 18)
- Docker & Docker Compose
- Android Studio (pour l'app mobile)
- Ollama (pour exécuter les modèles IA localement)

---

## 1. Installation et lancement d'Ollama

Ollama permet d'exécuter des modèles d'IA localement.


```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

```


---

## 2. Lancer le backend avec Docker Compose

Placez-vous dans le dossier `backend/` puis lancez :

```bash
docker-compose up --build -d
```

Cela démarre l'API NestJS et MongoDB dans des conteneurs.

---

## 3. Configuration de l'adresse IP côté application mobile

L'application mobile doit pointer vers l'IP du backend (API REST). Par défaut, elle utilise `10.0.2.2` (émulateur Android). Pour utiliser un autre backend (ex : sur le même réseau WiFi) :

1. Ouvrez le fichier de configuration réseau de l'app mobile (SudChat/MobileApp/app/src/main/java/com/example/sudchat/di/AppModule.kt).
2. Modifiez la constante de base URL, par exemple :

```kotlin
    .baseUrl("http://10.181.0.2.2:3000/")
```

3. Recompilez et relancez l'application.

> **Astuce** : Sur un vrai appareil, assurez-vous que le téléphone et le backend sont sur le même réseau local.

---

## 4. Ressources utiles
- [Documentation Ollama](https://ollama.com/)
