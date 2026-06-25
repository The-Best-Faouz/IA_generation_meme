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
| Production (Render)           | `https://klip-backend.onrender.com` |
