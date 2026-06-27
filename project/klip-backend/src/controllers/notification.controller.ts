import { Request, Response } from 'express';
import {
  analyzeConversationForMeme,
  batchAnalyzeNotifications,
} from '../services/notificationAnalyzer.service';

export const analyzeMessages = async (req: Request, res: Response) => {
  try {
    const { messages, country } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages requis (tableau non vide)' });
    }
    const result = await analyzeConversationForMeme(messages, country || 'FR');
    return res.json({ suggestion: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const analyzeNotifications = async (req: Request, res: Response) => {
  try {
    const { notifications, country } = req.body;
    if (!notifications || !Array.isArray(notifications)) {
      return res.status(400).json({ error: 'notifications requis (tableau)' });
    }
    const results = await batchAnalyzeNotifications(notifications, country || 'FR');
    return res.json({ suggestions: results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
