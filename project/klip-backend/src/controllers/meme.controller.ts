import { Request, Response } from 'express';
import { Meme } from '../models/Meme.model';
import { generateMeme } from '../services/ai.orchestrator';
import { uploadToCloudinary } from '../services/cloudinary.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const generateFromText = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    const userId = req.userId!;

    if (!text) {
      res.status(400).json({ error: 'Texte requis' });
      return;
    }

    const result = await generateMeme('text', text, 'CM');

    const cloudResult = await uploadToCloudinary(result.imageBuffer, 'meme');

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

    res.status(200).json({
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      caption: result.caption,
      memeId: meme._id,
      aiProvider: result.provider,
    });
  } catch (error) {
    console.error('generateFromText error:', error);
    res.status(503).json({ error: 'Service IA temporairement indisponible, réessaie dans quelques minutes' });
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

    const cloudResult = await uploadToCloudinary(result.imageBuffer, 'meme');

    const meme = new Meme({
      userId,
      type: 'image',
      inputText: 'Image uploadée par l\'utilisateur',
      caption: result.caption,
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      cloudinaryPublicId: cloudResult.publicId,
      aiProvider: result.provider,
    });
    await meme.save();

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      caption: result.caption,
      memeId: meme._id,
      aiProvider: result.provider,
    });
  } catch (error) {
    console.error('generateFromImage error:', error);
    res.status(503).json({ error: 'Service IA temporairement indisponible, réessaie dans quelques minutes' });
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

    const cloudResult = await uploadToCloudinary(result.imageBuffer, 'meme');

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

    res.status(200).json({
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      caption: result.caption,
      memeId: meme._id,
      aiProvider: result.provider,
    });
  } catch (error) {
    console.error('generateFromPrompt error:', error);
    res.status(503).json({ error: 'Service IA temporairement indisponible, réessaie dans quelques minutes' });
  }
};
