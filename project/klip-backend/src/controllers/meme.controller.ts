import { Response } from 'express';
import { Meme } from '../models/Meme.model';
import { generateMeme } from '../services/ai.orchestrator';
import { uploadToCloudinary } from '../services/cloudinary.service';
import { AuthRequest } from '../middleware/auth.middleware';

type TextMemeContext = {
  situation?: string;
  people?: string;
  tone?: string;
  audience?: string;
  extra?: string;
};

const buildTextMemeBrief = (text: string, context?: TextMemeContext): string => {
  const parts = [
    `Texte brut: ${text}`,
    context?.situation ? `Situation: ${context.situation}` : '',
    context?.people ? `Personnages: ${context.people}` : '',
    context?.tone ? `Ton: ${context.tone}` : '',
    context?.audience ? `Public cible: ${context.audience}` : '',
    context?.extra ? `Details supplementaires: ${context.extra}` : '',
    'Consigne: transforme cela en meme. La legende doit ressembler a un vrai meme, etre concise, naturelle, orientee contexte, et readable en une seconde.',
  ].filter(Boolean);

  return parts.join('\n');
};

export const generateFromText = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, context } = req.body as { text?: string; context?: TextMemeContext };
    const userId = req.userId!;

    if (!text) {
      res.status(400).json({ error: 'Texte requis' });
      return;
    }

    const result = await generateMeme('text', buildTextMemeBrief(text, context), 'CM');

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
        inputText: text,
        caption: result.caption,
        imageUrl: cloudResult.url,
        webpUrl: cloudResult.webpUrl,
        cloudinaryPublicId: cloudResult.publicId,
        aiProvider: result.provider,
      });
      await meme.save();
      memeId = meme._id;
    } catch {}

    res.status(200).json({
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      caption: result.caption,
      memeId,
      aiProvider: result.provider,
    });
  } catch (error) {
    console.error('generateFromText error:', error);
    res.status(503).json({ error: 'Service IA temporairement indisponible, reessaie dans quelques minutes' });
  }
};

export const generateFromImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    if (!req.file) {
      res.status(400).json({ error: 'Image requise' });
      return;
    }

    const fs = await import('fs');
    const imageBuffer = fs.readFileSync(req.file.path);

    const result = await generateMeme('image', imageBuffer, 'CM');

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
        type: 'image',
        inputText: 'Image uploadee par l utilisateur',
        caption: result.caption,
        imageUrl: cloudResult.url,
        webpUrl: cloudResult.webpUrl,
        cloudinaryPublicId: cloudResult.publicId,
        aiProvider: result.provider,
      });
      await meme.save();
      memeId = meme._id;
    } catch {}

    try { fs.unlinkSync(req.file.path); } catch {}

    res.status(200).json({
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      caption: result.caption,
      memeId,
      aiProvider: result.provider,
    });
  } catch (error) {
    console.error('generateFromImage error:', error);
    res.status(503).json({ error: 'Service IA temporairement indisponible, reessaie dans quelques minutes' });
  }
};

export const generateFromPrompt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    const userId = req.userId!;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt requis' });
      return;
    }

    const result = await generateMeme('prompt', prompt, 'CM');

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
        type: 'prompt',
        inputText: prompt,
        caption: result.caption,
        imageUrl: cloudResult.url,
        webpUrl: cloudResult.webpUrl,
        cloudinaryPublicId: cloudResult.publicId,
        aiProvider: result.provider,
      });
      await meme.save();
      memeId = meme._id;
    } catch {}

    res.status(200).json({
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      caption: result.caption,
      memeId,
      aiProvider: result.provider,
    });
  } catch (error) {
    console.error('generateFromPrompt error:', error);
    res.status(503).json({ error: 'Service IA temporairement indisponible, reessaie dans quelques minutes' });
  }
};
