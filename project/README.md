# KLIP — Frontend Mobile

## Prérequis
- Node.js 20 LTS
- React Native CLI (`npm install -g react-native-cli`)
- Java 17 (pas 21, pas 11)
- Android Studio + SDK Android (API 26 minimum)
- Un émulateur AVD ou un téléphone Android branché en USB

## Installation
1. `git clone <url-du-repo>`
2. `cd klip-frontend`
3. `npm install`
4. `cp .env.example .env`
5. Mettre l'URL du backend dans `.env`
6. `npx react-native run-android`

## Note importante
React Native version 0.74 est fixée.
Ne pas mettre à jour cette version sans accord de toute l'équipe.

## Architecture

```
src/
├── App.tsx                    # Racine, navigation principale
├── constants/
│   ├── api.ts                 # URL du backend
│   └── colors.ts              # Palette de couleurs
├── i18n/
│   ├── index.ts               # Config i18next
│   ├── fr.json                # Textes français
│   └── en.json                # Textes anglais
├── navigation/
│   ├── AppNavigator.tsx       # Navigation app (tabs + stacks)
│   └── AuthNavigator.tsx      # Navigation auth (login/register)
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── create/
│   │   ├── ContextReaderScreen.tsx
│   │   ├── StatusRemixerScreen.tsx
│   │   ├── PromptScreen.tsx
│   │   ├── FaceSwapScreen.tsx
│   │   └── GifEditorScreen.tsx
│   ├── preview/
│   │   └── PreviewScreen.tsx
│   ├── gallery/
│   │   ├── GalleryScreen.tsx
│   │   └── MemeDetailScreen.tsx
│   ├── telegram/
│   │   ├── TelegramConnectScreen.tsx
│   │   └── TelegramFeedScreen.tsx
│   └── profile/
│       └── ProfileScreen.tsx
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Loader.tsx
│   │   └── ErrorMessage.tsx
│   └── meme/
│       ├── MemeCard.tsx
│       ├── TextOverlay.tsx
│       └── GifPreview.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useTelegram.ts
└── services/
    └── api.service.ts         # Appels HTTP au backend
```

## URL du backend selon l'environnement

| Contexte                      | URL à utiliser dans .env  |
|-------------------------------|---------------------------|
| Émulateur Android (AVD)       | `http://10.0.2.2:3000`   |
| Téléphone physique (USB/WiFi) | `http://192.168.X.X:3000` |


# KLIP — Backend

## Prérequis
- Node.js 20 LTS
- MongoDB Atlas (compte gratuit sur mongodb.com)
- Cloudinary (compte gratuit sur cloudinary.com)
- Clés API : Gemini, OpenAI, HuggingFace, Groq, Replicate
- Telegram Bot Token (via @BotFather sur Telegram)
- FFmpeg installé sur le système

## Installation
1. `git clone <url-du-repo>`
2. `cd klip-backend`
3. `npm install`
4. `cp .env.example .env`
5. Remplir toutes les valeurs dans `.env`
6. `npm run dev`

Le serveur démarre sur http://localhost:3000

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| PORT | Port du serveur (défaut: 3000) |
| NODE_ENV | development ou production |
| MONGODB_URI | URI de connexion MongoDB Atlas |
| JWT_SECRET | Clé secrète pour les tokens JWT |
| JWT_REFRESH_SECRET | Clé secrète pour les refresh tokens |
| CLOUDINARY_CLOUD_NAME | Nom du cloud Cloudinary |
| CLOUDINARY_API_KEY | Clé API Cloudinary |
| CLOUDINARY_API_SECRET | Secret API Cloudinary |
| GEMINI_API_KEY | Clé API Google Gemini |
| OPENAI_API_KEY | Clé API OpenAI |
| HUGGINGFACE_API_KEY | Clé API HuggingFace |
| GROQ_API_KEY | Clé API Groq (Whisper) |
| REPLICATE_API_TOKEN | Token API Replicate |
| TELEGRAM_BOT_TOKEN | Token du bot Telegram |
| FRONTEND_URL | URL du frontend pour CORS |

## Endpoints

### Auth
- `POST /auth/register` — Créer un compte
- `POST /auth/login` — Connexion
- `POST /auth/refresh` — Rafraîchir le token

### Mèmes
- `POST /meme/text` — Générer mème depuis texte
- `POST /meme/image` — Générer mème depuis image
- `POST /meme/prompt` — Générer mème depuis prompt
- `POST /meme/faceswap` — Face swap sur 2 images
- `POST /meme/gif` — Éditer GIF avec instruction vocale

### Galerie
- `GET /gallery?page=1&limit=20` — Liste des créations
- `GET /gallery/:id` — Détail d'un mème
- `DELETE /gallery/:id` — Supprimer un mème

### Telegram
- `POST /telegram/connect` — Connecter un bot Telegram
- `GET /telegram/messages?chatId=...` — Lire les messages
- `POST /telegram/send` — Envoyer une image dans un chat

### Profil
- `GET /user/profile` — Infos utilisateur
- `PUT /user/profile` — Modifier profil
