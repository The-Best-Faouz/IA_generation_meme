import { Request, Response } from 'express';
import { parseWhatsAppChat, conversationStats } from '../services/chatParser.service';
import { generateWithGemini } from '../services/gemini.service';

export const parseChat = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Contenu du chat requis' });
    }
    const parsed = parseWhatsAppChat(content);
    const stats = conversationStats(parsed.messages);
    return res.json({
      title: parsed.title,
      participants: parsed.participants,
      messageCount: parsed.messages.length,
      stats,
      preview: parsed.messages.slice(0, 10),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateMemesFromChat = async (req: Request, res: Response) => {
  try {
    const { content, country, count } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Contenu du chat requis' });
    }
    const parsed = parseWhatsAppChat(content);
    const recentMessages = parsed.messages.slice(-30).map(m => `${m.sender}: ${m.text}`).join('\n');
    const memeCount = Math.min(count || 5, 10);

    const prompt = `Analyse cette conversation WhatsApp et génère ${memeCount} memes humoristiques adaptés.
Pour chaque meme, donne:
1. Le type (text/image/prompt)
2. La légende/l'image à générer
3. Pourquoi c'est drôle

Format JSON UNIQUEMENT:
{
  "memes": [
    {"type": "text", "caption": "...", "reason": "..."}
  ]
}

Contexte culturel: ${country || 'FR'}
Conversation:
${recentMessages}`;

    const result = await generateWithGemini('text', Buffer.from(prompt), country || 'FR', '');
    return res.json({
      chatTitle: parsed.title,
      participants: parsed.participants,
      memes: result.caption,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
