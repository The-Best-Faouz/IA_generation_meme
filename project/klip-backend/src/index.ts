import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import memeRoutes from './routes/meme.routes';
import faceswapRoutes from './routes/faceswap.routes';
import gifRoutes from './routes/gif.routes';
import galleryRoutes from './routes/gallery.routes';
import userRoutes from './routes/user.routes';
import telegramRoutes from './routes/telegram.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/klip';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8081';

app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes, attends 1 minute.' },
});
app.use(generalLimiter);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur MongoDB:', err));

app.use('/auth', authRoutes);
app.use('/meme', memeRoutes);
app.use('/meme', faceswapRoutes);
app.use('/meme', gifRoutes);
app.use('/gallery', galleryRoutes);
app.use('/user', userRoutes);
app.use('/telegram', telegramRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Serveur KLIP démarré sur le port ${PORT}`);
});
