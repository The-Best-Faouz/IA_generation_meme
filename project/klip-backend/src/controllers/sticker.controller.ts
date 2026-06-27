import { Request, Response } from 'express';
import { processSticker, swapFaceOnSticker, addTextToSticker } from '../services/sticker.service';
import { uploadToCloudinary } from '../services/cloudinary.service';

export const processStickerAction = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Fichier sticker requis' });
    }
    const result = await processSticker(file.buffer, file.mimetype);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const swapFaceOnStickerAction = async (req: Request, res: Response) => {
  try {
    const { stickerUri, faceUri } = req.body;
    if (!stickerUri || !faceUri) {
      return res.status(400).json({ error: 'stickerUri et faceUri requis' });
    }
    const result = await swapFaceOnSticker(stickerUri, faceUri);
    const cloudResult = await uploadToCloudinary(result.imageBuffer, 'sticker');
    return res.json({
      imageUrl: cloudResult.url,
      publicId: cloudResult.publicId,
      format: result.format,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addTextToStickerAction = async (req: Request, res: Response) => {
  try {
    const { stickerUri, text } = req.body;
    if (!stickerUri || !text) {
      return res.status(400).json({ error: 'stickerUri et text requis' });
    }
    const result = await addTextToSticker(stickerUri, text);
    const cloudResult = await uploadToCloudinary(result.imageBuffer, 'sticker');
    return res.json({
      imageUrl: cloudResult.url,
      publicId: cloudResult.publicId,
      format: result.format,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
