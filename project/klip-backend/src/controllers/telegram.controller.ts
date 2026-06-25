import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TelegramSession } from '../models/TelegramSession.model';
import { User } from '../models/User.model';
import TelegramBot from 'node-telegram-bot-api';

const activeBots = new Map<string, TelegramBot>();

export const connectBot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { botToken } = req.body;

    if (!botToken) {
      res.status(400).json({ error: 'Token du bot requis' });
      return;
    }

    const bot = new TelegramBot(botToken, { polling: false });
    const me = await bot.getMe();

    await User.findByIdAndUpdate(userId, { telegramBotToken: botToken });

    let session = await TelegramSession.findOne({ userId });
    if (!session) {
      session = new TelegramSession({ userId, botToken });
    } else {
      session.botToken = botToken;
      session.isActive = true;
    }
    await session.save();

    activeBots.set(userId, bot);

    res.status(200).json({ success: true, botUsername: me.username ? `@${me.username}` : 'Bot' });
  } catch (error) {
    console.error('connectBot error:', error);
    res.status(400).json({ error: 'Token de bot invalide' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const chatId = req.query.chatId as string;
    const limit = parseInt(req.query.limit as string) || 20;

    const session = await TelegramSession.findOne({ userId });
    if (!session || !session.isActive) {
      res.status(400).json({ error: 'Aucun bot Telegram connecté' });
      return;
    }

    let bot = activeBots.get(userId);
    if (!bot) {
      bot = new TelegramBot(session.botToken, { polling: false });
      activeBots.set(userId, bot);
    }

    if (chatId) {
      const messages: any[] = [];
      res.status(200).json({ messages });
      return;
    }

    const updates = await bot.getUpdates({ limit });
    const messages = updates
      .filter((u) => u.message?.text)
      .map((u) => ({
        messageId: u.message?.message_id,
        text: u.message?.text,
        from: u.message?.from?.first_name || 'Inconnu',
        date: u.message?.date,
      }));

    res.status(200).json({ messages });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ error: 'Erreur Telegram' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { chatId, imageUrl, caption } = req.body;

    if (!chatId || !imageUrl) {
      res.status(400).json({ error: 'chatId et imageUrl requis' });
      return;
    }

    const session = await TelegramSession.findOne({ userId });
    if (!session || !session.isActive) {
      res.status(400).json({ error: 'Aucun bot Telegram connecté' });
      return;
    }

    let bot = activeBots.get(userId);
    if (!bot) {
      bot = new TelegramBot(session.botToken, { polling: false });
      activeBots.set(userId, bot);
    }

    const axios = (await import('axios')).default;
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    const sent = await bot.sendPhoto(chatId, imageBuffer, { caption: caption || '' });

    res.status(200).json({ success: true, telegramMessageId: sent.message_id });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ error: 'Erreur envoi Telegram' });
  }
};
