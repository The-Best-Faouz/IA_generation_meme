# 🎨 KLIP Studio — Générateur de Memes Intelligent (IA)

**KLIP** est une plateforme mobile et backend de pointe conçue pour transformer n'importe quel contexte (discussions, textes, instructions vocales, expressions faciales, images) en **memes hilarants, pertinents et culturellement adaptés** grâce à l'Intelligence Artificielle.

L'écosystème est composé de deux briques technologiques principales :
1. 🖥️ **`klip-backend`** : Un serveur d'API robuste en Node.js, TypeScript et Express qui orchestre les appels d'IA, le traitement d'images et la persistance des données.
2. 📱 **`klip-frontend`** : Une application mobile moderne construite en React Native et TypeScript pour offrir une expérience utilisateur fluide, rapide et immersive.

---

## 🚀 Fonctionnalités Clés & Fonctionnement Interne

### 1. 🎤 Note Vocale (Voice Meme) `[Nouveau]`
* **Le Concept :** L'utilisateur s'exprime de vive voix (ex: *"Quand le prof dit qu'il n'y a pas de TP ce matin, mais qu'il envoie le sujet à 8h"*). L'IA capture cette voix, en extrait le texte et génère le meme visuel correspondant.
* **Sous le capot :**
  * **Frontend :** Capture audio native gérée via la bibliothèque `react-native-audio-recorder-player`. Elle gère de manière transparente les autorisations microphone sous Android/iOS et enregistre un fichier `.m4a` / `.mp4`.
  * **Backend :** Le fichier audio est transmis au serveur, qui appelle l'API de transcription ultra-rapide **Groq (modèle Whisper Large V3)**. 
  * **Génération :** Le texte transcrit est enrichi contextuellement pour servir de brief à l'orchestrateur d'IA, qui génère le meme visuel final.

### 2. 💬 Importation & Remix de Chat WhatsApp `[Amélioré]`
* **Le Concept :** L'utilisateur copie-colle un extrait de discussion ou utilise les notifications système reçues en temps réel pour générer instantanément un meme qui résume l'ambiance ou la blague interne de la conversation.
* **Sous le capot :**
  * **Parsing Résilient :** Le service `chatParser.service.ts` nettoie et structure le texte. Il intègre des algorithmes de secours (fallbacks) : s'il n'y a pas de format de date formel (ex: copier-coller à la volée), il repère les structures `Nom: Message` ou traite le bloc entier pour ne jamais planter.
  * **Analyse Contextuelle :** Un LLM analyse l'historique des 30 derniers messages pour en extraire la "vanne", le ton et la situation absurde.
  * **Génération Visuelle :** L'orchestrateur génère automatiquement l'image et la légende finale correspondant à ce contexte et redirige l'utilisateur vers l'écran de prévisualisation.

### 3. 🖼️ Status Remixer (Le Remix d'Image) `[Nouveau]`
* **Le Concept :** L'utilisateur télécharge sa propre photo et l'IA y inscrit une légende parfaitement alignée avec le contenu visuel.
* **Sous le capot :**
  * **Analyse de l'image :** Les modèles multimodaux (Gemini ou OpenAI Vision) étudient l'image d'origine pour en comprendre le contenu.
  * **Génération de Légende :** L'IA propose la légende humoristique la plus percutante.
  * **Fusion Visuelle Graphique :** Au lieu de redessiner une image, le backend utilise la bibliothèque haute performance **Sharp** pour intégrer un calque SVG. Elle formate dynamiquement le texte sur plusieurs lignes avec la police historique des memes (**Impact** en blanc avec contour noir) au-dessus d'un bandeau sombre semi-transparent.

### 4. 🔄 Face Swap (Échange de Visages) `[Optimisé]`
* **Le Concept :** Permet de coller son visage (ou celui d'une célébrité) sur n'importe quelle image source pour créer une situation burlesque.
* **Sous le capot :**
  * Alimenté par le modèle Replicate (`lucataco/faceswap`).
  * **Optimisation de Partage :** Intègre le module de partage système de React Native (`ShareIntentHandler`). Si l'utilisateur clique sur *"Partager"* sur une image externe (WhatsApp/Gallery) et l'envoie vers KLIP, l'application s'ouvre et charge directement cette image comme image source dans l'écran de Face Swap.

### 5. 🤖 Autres Outils
* **Context Reader (Text-to-Meme) :** Traduit une situation textuelle brute en meme culturellement adapté au pays de l'utilisateur (avec une attention particulière aux vannes locales d'Afrique centrale et du Cameroun `CM` grâce à des directives de prompt enrichies).
* **Prompt Libre :** Génération d'images complète à partir d'une simple description textuelle via **DALL-E 3** ou **Pollinations**.
* **Telegram Connect :** Liaison d'un bot Telegram personnel pour récupérer des flux de discussions de groupes et y publier instantanément les memes générés.

---

## 🛠️ Prérequis Système Globaux

Pour exécuter et compiler l'entièreté du projet localement, assurez-vous de disposer de :
- 🟢 **Node.js** (Version 20 LTS recommandée ou supérieure)
- 💾 **MongoDB** (Une instance locale ou une base de données cloud gratuite MongoDB Atlas)
- ☁️ **Cloudinary** (Un compte gratuit pour le stockage et l'optimisation des images générées)
- ☕ **Java Development Kit (JDK) 17** (Requis pour la compilation Android, ne pas utiliser JDK 21 ou supérieure)
- 🤖 **Android Studio** avec le SDK Android (API 34 installée) et un émulateur AVD configuré.
- 🎬 **FFmpeg** installé sur votre système (nécessaire pour la manipulation des fichiers audio/vidéo sur le backend).

---

## 🖥️ 1. Configuration & Lancement du Backend (`klip-backend`)

### Installation :
```bash
# Se déplacer dans le dossier backend
cd project/klip-backend

# Installer les dépendances
npm install
```

### Configuration des Variables d'Environnement :
Créez un fichier `.env` dans `project/klip-backend` à partir du modèle `.env.example` :
```bash
cp .env.example .env
```

Remplissez les clés suivantes dans le fichier `.env` :
```env
PORT=3000
NODE_ENV=development

# Connexion Base de Données
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/klip?retryWrites=true&w=majority
JWT_SECRET=votre_super_cle_secrete_jwt
JWT_REFRESH_SECRET=votre_cle_refresh_secrete_jwt

# Hébergement d'Images (Cloudinary)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Clés d'Intelligence Artificielle (Requises pour le fonctionnement des générateurs)
GEMINI_API_KEY=votre_cle_gemini       # Pour la compréhension de contexte
OPENAI_API_KEY=votre_cle_openai       # Pour GPT et DALL-E (remix / création d'images)
HUGGINGFACE_API_KEY=votre_cle_hf      # Fournisseur d'analyse alternatif
GROQ_API_KEY=votre_cle_groq           # Whisper : Transcription audio ultra-rapide
REPLICATE_API_TOKEN=votre_token_repl  # Face Swap (lucataco/faceswap)

# Configuration Bot Telegram (Optionnel)
TELEGRAM_BOT_TOKEN=votre_token_bot_telegram

# CORS Configuration (Adresse IP de votre frontend de dev)
FRONTEND_URL=http://localhost:8081,http://10.0.2.2:8081
```

### Démarrage en Mode Développement :
Le serveur utilise `nodemon` pour s'actualiser automatiquement lors des changements :
```bash
npm run dev
```
Le serveur démarre par défaut sur `http://localhost:3000`. Vous pouvez vérifier son état en ouvrant `http://localhost:3000/health`.

---

## 📱 2. Configuration & Lancement du Frontend Mobile (`klip-frontend`)

### Installation :
```bash
# Se déplacer dans le dossier frontend
cd project/klip-frontend

# Installer les dépendances
npm install
```

### Configuration des Variables d'Environnement :
Créez un fichier `.env` dans `project/klip-frontend` à partir du modèle `.env.example` :
```bash
cp .env.example .env
```

Éditez le fichier `.env` pour y insérer l'URL de votre serveur d'API backend :
```env
API_URL=http://10.0.2.2:3000
```
> ⚠️ **Note Cruciale Émulateur Android (AVD) :** Lorsque vous utilisez un émulateur Android Studio, la machine virtuelle émule un réseau interne où votre propre machine de développement est accessible à l'adresse IP `10.0.2.2`. N'utilisez pas `localhost` ou `127.0.0.1` car l'émulateur tenterait de se connecter à lui-même ! S'il s'agit d'un téléphone physique connecté en USB/Wi-Fi, spécifiez l'adresse IP locale de votre ordinateur sur votre réseau (ex: `http://192.168.1.50:3000`).

### Lancement de l'Application :

1. **Démarrer le serveur de développement Metro Bundler (React Native) :**
   ```bash
   npm start
   ```
2. **Compiler et lancer l'application sur votre émulateur ou appareil Android :**
   Dans un autre terminal :
   ```bash
   npm run android
   ```

---

## 🏗️ Architecture des Dossiers Principaux

```
IA_generation_meme/
├── project/
│   ├── klip-backend/              # 🖥️ SERVEUR BACKEND (TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts           # Point d'entrée de l'application Express
│   │   │   ├── config/            # Initialisation de Cloudinary, etc.
│   │   │   ├── controllers/       # Logique de routage (Meme, Chat, FaceSwap, etc.)
│   │   │   ├── middleware/        # Authentification JWT, Upload Multer, Rate Limiting
│   │   │   ├── models/            # Schémas Mongoose (User, Meme, TelegramSession)
│   │   │   ├── routes/            # Définition des endpoints REST
│   │   │   └── services/          # Services d'IA (Groq Whisper, AI Orchestrator, Sharp, etc.)
│   │   └── package.json
│   │
│   ├── klip-frontend/             # 📱 APPLICATION MOBILE (React Native)
│   │   ├── android/               # Dossier natif Android (fichiers de build Gradle)
│   │   ├── src/
│   │   │   ├── App.tsx            # Gestionnaire de navigation principal
│   │   │   ├── components/        # Composants réutilisables (Loader, Button, Input, Icon)
│   │   │   ├── constants/         # Thème de couleurs, configuration API locale
│   │   │   ├── i18n/              # Support multilingue (FR / EN)
│   │   │   ├── navigation/        # Routes d'écrans (AppNavigator / AuthNavigator)
│   │   │   ├── screens/           # Écrans de l'app (Note Vocale, FaceSwap, ChatImport, etc.)
│   │   │   └── services/          # Client axios API, partage natif, etc.
│   │   └── package.json
```

---

## 🛠️ Stack Technique & Technologies Utilisées

* **Base de l'Écosystème :** TypeScript & Node.js
* **Backend :** Express, Mongoose (MongoDB ODM), Multer (chargement multipart), Sharp (traitement d'image haute performance).
* **Services d'IA intégrés :**
  * **Transcription Audio :** Groq API (Modèle Whisper Large V3)
  * **Interprétation de Contexte :** Google Gemini API & OpenAI GPT-4o
  * **Génération d'images :** OpenAI DALL-E 3 & Pollinations.ai
  * **Face Swap :** Replicate (lucataco/faceswap)
* **Frontend Mobile :** React Native 0.74, React Navigation (Stack & Tab layout), Axios (requêtes HTTP), React Native Audio Recorder Player (enregistrement/écoute).

---

## ⚙️ Déploiement en Production
* **Backend :** Parfaitement conçu pour être déployé sur **Railway** (les fichiers de configuration `.railwayignore` et `railway.json` sont inclus dans `klip-backend`) ou sur **Render**.
* **Frontend :** Le workflow GitHub Actions dans `.github/workflows/build.yml` compile automatiquement l'application et génère un fichier APK Android Release à chaque push ou pull request sur la branche `main`.
