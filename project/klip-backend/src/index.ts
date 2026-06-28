import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import http from 'http';
import https from 'https';

import authRoutes from './routes/auth.routes';
import memeRoutes from './routes/meme.routes';
import faceswapRoutes from './routes/faceswap.routes';
import gifRoutes from './routes/gif.routes';
import galleryRoutes from './routes/gallery.routes';
import userRoutes from './routes/user.routes';
import telegramRoutes from './routes/telegram.routes';
import stickerRoutes from './routes/sticker.routes';
import gifEditorRoutes from './routes/gif-editor.routes';
import notificationRoutes from './routes/notification.routes';
import chatRoutes from './routes/chat.routes';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/klip';
const FRONTEND_URLS = (process.env.FRONTEND_URL || 'http://localhost:8081').split(',').map(s => s.trim());
const RENDER_URL = process.env.RENDER_URL || '';

app.use(helmet());
app.use(cors({
  origin: FRONTEND_URLS,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Trop de tentatives, réessaye dans 15 minutes.' },
});
app.use('/auth', authLimiter);

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes, attends 1 minute.' },
});
app.use(generalLimiter);

app.use('/auth', authRoutes);
app.use('/meme', memeRoutes);
app.use('/meme', faceswapRoutes);
app.use('/meme', gifRoutes);
app.use('/gallery', galleryRoutes);
app.use('/user', userRoutes);
app.use('/telegram', telegramRoutes);
app.use('/sticker', stickerRoutes);
app.use('/gif-editor', gifEditorRoutes);
app.use('/notification', notificationRoutes);
app.use('/chat', chatRoutes);

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  uptime: Math.floor(process.uptime()),
  timestamp: new Date().toISOString(),
}));

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur MongoDB:', err));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur KLIP démarré sur le port ${PORT}`);
  if (RENDER_URL) startKeepAlive();
});
server.on('error', (err: Error) => {
  console.error('SERVER ERROR:', err.message, err.stack);
});

function startKeepAlive() {
  const intervalMs = 4 * 60 * 1000;
  setInterval(() => {
    try {
      const client = RENDER_URL.startsWith('https') ? https : http;
      const req = client.get(RENDER_URL + '/health', (res: any) => res.resume());
      req.on('error', () => {});
      req.setTimeout(10000, () => req.destroy());
    } catch {}
  }, intervalMs);
  console.log(`Keep-alive activé vers ${RENDER_URL}`);
}
