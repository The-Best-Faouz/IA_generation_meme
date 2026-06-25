import { useState, useCallback } from 'react';
import api from '../services/api.service';

export interface TelegramMessage {
  messageId: number;
  text: string;
  from: string;
  date: number;
}

export const useTelegram = () => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const connectBot = useCallback(async (botToken: string) => {
    setLoading(true);
    try {
      const res = await api.post('/telegram/connect', { botToken });
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMessages = useCallback(async (chatId?: string) => {
    setLoading(true);
    try {
      const url = chatId ? `/telegram/messages?chatId=${chatId}` : '/telegram/messages';
      const res = await api.get(url);
      setMessages(res.data.messages || []);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (chatId: string, imageUrl: string, caption?: string) => {
    const res = await api.post('/telegram/send', { chatId, imageUrl, caption });
    return res.data;
  }, []);

  return { messages, loading, connectBot, getMessages, sendMessage };
};
