import { Response } from 'express';
import { Meme } from '../models/Meme.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { transcribeAudio } from '../services/groq.service';
import { uploadToCloudinary } from '../services/cloudinary.service';
import fs from 'fs';

export const generateGif = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.gif?.[0] || !files?.audio?.[0]) {
      res.status(400).json({ error: 'GIF et audio requis' });
      return;
    }

    const audioBuffer = fs.readFileSync(files.audio[0].path);
    const transcription = await transcribeAudio(audioBuffer);

    const gifBuffer = fs.readFileSync(files.gif[0].path);

    const cloudResult = await uploadToCloudinary(gifBuffer, 'gif');

    const meme = new Meme({
      userId,
      type: 'gif',
      inputText: transcription,
      audioTranscription: transcription,
      caption: transcription,
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      gifUrl: cloudResult.url,
      cloudinaryPublicId: cloudResult.publicId,
      aiProvider: 'groq',
    });
    await meme.save();

    fs.unlinkSync(files.gif[0].path);
    fs.unlinkSync(files.audio[0].path);

    res.status(200).json({
      transcription,
      gifUrl: cloudResult.url,
      memeId: meme._id,
    });
  } catch (error) {
    console.error('generateGif error:', error);
    res.status(503).json({ error: 'Service GIF temporairement indisponible' });
  }
};
