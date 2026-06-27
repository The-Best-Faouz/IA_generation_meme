import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import crypto from 'crypto';
import {
  extractFrames,
  reassembleGif,
  editFrameWithAi,
  getGifMetadata,
} from '../services/gif.service';
import { uploadToCloudinary } from '../services/cloudinary.service';
import { generateWithGemini } from '../services/gemini.service';

export const getGifInfo = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Fichier GIF requis' });
    const metadata = await getGifMetadata(file.buffer);
    return res.json(metadata);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const voiceEditGif = async (req: Request, res: Response) => {
  const workDir = path.join(tmpdir(), `klip_gif_${crypto.randomUUID()}`);
  const outputPath = path.join(tmpdir(), `klip_gif_out_${crypto.randomUUID()}.gif`);

  try {
    const file = req.file;
    const { voiceCommand, language } = req.body;

    if (!file) return res.status(400).json({ error: 'Fichier GIF requis' });
    if (!voiceCommand) return res.status(400).json({ error: 'Commande vocale requise' });

    fs.mkdirSync(workDir, { recursive: true });

    const frames = await extractFrames(file.buffer, workDir);
    if (frames.length === 0) {
      return res.status(400).json({ error: 'Impossible d\'extraire les frames' });
    }

    const aiPrompt = `Tu es un assistant qui analyse des images GIF. Voici la commande vocale de l'utilisateur: "${voiceCommand}".
Décris précisément ce qu'il faut modifier sur chaque frame du GIF. Sois très spécifique.`;
    const aiResult = await generateWithGemini('image', file.buffer, language || 'FR', aiPrompt);

    const maxFrames = Math.min(frames.length, 20);
    for (let i = 0; i < maxFrames; i++) {
      const outputFrame = path.join(workDir, `edited_${String(i).padStart(4, '0')}.png`);
      await editFrameWithAi(frames[i].path, voiceCommand, outputFrame);
    }

    const editedPaths: string[] = [];
    for (let i = 0; i < maxFrames; i++) {
      const editedPath = path.join(workDir, `edited_${String(i).padStart(4, '0')}.png`);
      if (fs.existsSync(editedPath)) editedPaths.push(editedPath);
    }

    await reassembleGif(editedPaths, outputPath);

    const outputBuffer = fs.readFileSync(outputPath);
    const cloudResult = await uploadToCloudinary(outputBuffer, 'gif');

    return res.json({
      imageUrl: cloudResult.url,
      publicId: cloudResult.publicId,
      provider: 'gemini',
      aiAnalysis: aiResult.caption,
      originalFrames: frames.length,
      processedFrames: editedPaths.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  } finally {
    try { fs.rmSync(workDir, { recursive: true, force: true }); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
  }
};
