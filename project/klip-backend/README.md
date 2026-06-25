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
