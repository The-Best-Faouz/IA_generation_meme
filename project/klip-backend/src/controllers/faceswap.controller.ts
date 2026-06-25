import { Response } from 'express';
import { Meme } from '../models/Meme.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { runFaceSwap } from '../services/replicate.service';
import { uploadToCloudinary } from '../services/cloudinary.service';
import fs from 'fs';

export const faceSwap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.source?.[0] || !files?.face?.[0]) {
      res.status(400).json({ error: 'Deux images requises: source et face' });
      return;
    }

    const sourceBuffer = fs.readFileSync(files.source[0].path);
    const faceBuffer = fs.readFileSync(files.face[0].path);

    const resultBuffer = await runFaceSwap(sourceBuffer, faceBuffer);

    const cloudResult = await uploadToCloudinary(resultBuffer, 'faceswap');

    const meme = new Meme({
      userId,
      type: 'faceswap',
      inputText: 'Face swap',
      caption: 'Face swap généré',
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      cloudinaryPublicId: cloudResult.publicId,
      aiProvider: 'replicate',
    });
    await meme.save();

    fs.unlinkSync(files.source[0].path);
    fs.unlinkSync(files.face[0].path);

    res.status(200).json({
      imageUrl: cloudResult.url,
      webpUrl: cloudResult.webpUrl,
      memeId: meme._id,
    });
  } catch (error) {
    console.error('faceSwap error:', error);
    res.status(503).json({ error: 'Service Face Swap temporairement indisponible' });
  }
};
