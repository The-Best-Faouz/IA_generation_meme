import { Response } from 'express';
import { parseWhatsAppChat, conversationStats } from '../services/chatParser.service';
import { generateMeme } from '../services/ai.orchestrator';
import { uploadToCloudinary } from '../services/cloudinary.service';
import { Meme } from '../models/Meme.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const parseChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Contenu du chat requis' });
      return;
    }
    const parsed = parseWhatsAppChat(content);
    const stats = conversationStats(parsed.messages);
    res.json({
      title: parsed.title,
      participants: parsed.participants,
      messageCount: parsed.messages.length,
      stats,
      preview: parsed.messages.slice(0, 10),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const generateMemesFromChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, country } = req.body;
    const userId = req.userId!;

    if (!content) {
      res.status(400).json({ error: 'Contenu du chat requis' });
      return;
    }

    const parsed = parseWhatsAppChat(content);
    const recentMessages = parsed.messages.slice(-30).map(m => `${m.sender}: ${m.text}`).join('\n');

    const brief = `Analyse cette conversation WhatsApp et crée un meme unique extrêmement humoristique qui capture l'essence, la vanne principale, l'absurdité ou la situation vécue par les participants.
La légende doit être courte (1-2 lignes), percutante, drôle et écrite du point de vue d'un observateur extérieur (style meme traditionnel).

Contexte culturel: ${country || 'CM'}
Conversation :
${recentMessages}`;

    const result = await generateMeme('text', brief, country || 'CM');

    let cloudResult;
    try {
      cloudResult = await uploadToCloudinary(result.imageBuffer, 'meme');
    } catch {
      const base64 = result.imageBuffer.toString('base64');
      cloudResult = { url: `data:image/svg+xml;base64,${base64}`, webpUrl: '', publicId: `local_${Date.now()}` };
    }

    let memeId = null;
    try {
      const meme = new Meme({
        userId,
        type: 'text',
        inputText: `Discussion WhatsApp: ${parsed.title}`,
        caption: result.caption,
        imageUrl: cloudResult.url,
        webpUrl: cloudResult.webpUrl,
        cloudinaryPublicId: cloudResult.publicId,
        aiProvider: result.provider,
      });
      await meme.save();
      memeId = meme._id;
    } catch (e) {
      console.error('Error saving chat meme:', e);
    }

    res.status(200).json({
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      caption: result.caption,
      memeId,
      aiProvider: result.provider,
    });
  } catch (error: any) {
    console.error('generateMemesFromChat error:', error);
    res.status(503).json({ error: 'Service d\'IA de génération de meme à partir de chat indisponible' });
  }
};
