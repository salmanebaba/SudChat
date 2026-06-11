# SudChat - Guide de démarrage

Ce projet comprend un backend NestJS (API REST), une application mobile Android (Kotlin/Jetpack Compose) et l'intégration d'agents IA via Ollama.

## Prérequis
- Node.js (>= 18)
- Docker & Docker Compose
- Android Studio (pour l'app mobile)
- Ollama (pour exécuter les modèles IA localement)

---

## 1. Installation et lancement d'Ollama

Ollama permet d'exécuter des modèles d'IA localement sur votre machine.

### Option A: Installation directe sur la machine hôte

```bash
# Télécharger et installer Ollama
# https://ollama.com/download

# Démarrer le service Ollama
ollama serve
```

### Option B: Utiliser Docker

```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### Télécharger les modèles nécessaires

Le projet utilise les modèles suivants (définis dans `.env`). Téléchargez-les avec :

```bash
ollama pull qwen2.5:3b          # Modèle routeur
ollama pull llama3.1:8b         # Modèle général
ollama pull qwen2.5-coder:7b    # Modèle pour le coding
ollama pull phi4                # Modèle reasoning
```



---

## 2. Lancer le backend avec Docker Compose

### Prérequis
- Ollama doit être en cours d'exécution (voir section 1)
- Les modèles Ollama doivent être téléchargés

### Étapes

1. Accédez au répertoire backend :
```bash
cd backend
```

2. Lancez Docker Compose :
```bash
docker-compose up --build -d
```

Cela démarre les services suivants :
- **API NestJS** : http://localhost:3000
- **MongoDB** : mongodb://localhost:27017
- **Connexion à Ollama** : http://ollama-host:11434 (voir `.env`)

---

## 3. Configuration et variables d'environnement

Le fichier `backend/.env` contient les paramètres de configuration :

```env
# Database
MONGO_URI=mongodb://mongo:27017/ollama_chat

# JWT
JWT_SECRET=secret_key
JWT_EXPIRES_IN=60m

# Server
PORT=3000

# Ollama
OLLAMA_URL=http://ollama-host:11434/api/generate

# Model Routing Configurations
OLLAMA_ROUTER_MODEL=qwen2.5:3b
OLLAMA_GENERAL_MODEL=llama3.1:8b
OLLAMA_CODING_MODEL=qwen2.5-coder:7b
OLLAMA_REASONING_MODEL=phi4

# Chat
CHAT_TITLE_LENGTH=30
BCRYPT_ROUNDS=10
```

**Astuce** : Si vous avez installé Ollama directement sur la machine hôte (Option A), modifiez `OLLAMA_URL` en :
```env
OLLAMA_URL=http://host.docker.internal:11434/api/generate
```

---

## 4. Configuration de l'adresse IP côté application mobile

L'application mobile doit pointer vers l'IP du backend (API REST). Par défaut, elle utilise `10.0.2.2` (émulateur Android). Pour utiliser un autre backend (ex : sur le même réseau WiFi) :

1. Ouvrez le fichier de configuration réseau de l'app mobile (SudChat/MobileApp/app/src/main/java/com/example/sudchat/di/AppModule.kt).
2. Modifiez la constante de base URL, par exemple :

```kotlin
    .baseUrl("http://10.181.0.2.2:3000/")
```

3. Recompilez et relancez l'application.

> **Astuce** : Sur un vrai appareil, assurez-vous que le téléphone et le backend sont sur le même réseau local.

---

## 5. Ressources utiles
- [Documentation Ollama](https://ollama.com/)
