import { Response } from 'express';
import { Meme } from '../models/Meme.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { deleteFromCloudinary } from '../services/cloudinary.service';

export const getGallery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [memes, total] = await Promise.all([
      Meme.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('id imageUrl type createdAt'),
      Meme.countDocuments({ userId }),
    ]);

    res.status(200).json({
      memes: memes.map((m) => ({ id: m._id, imageUrl: m.imageUrl, type: m.type, createdAt: m.createdAt })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('getGallery error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getMemeDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const meme = await Meme.findOne({ _id: id, userId });
    if (!meme) {
      res.status(404).json({ error: 'Mème introuvable' });
      return;
    }

    res.status(200).json({ meme });
  } catch (error) {
    console.error('getMemeDetail error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteMeme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const meme = await Meme.findOne({ _id: id, userId });
    if (!meme) {
      res.status(404).json({ error: 'Mème introuvable' });
      return;
    }

    await deleteFromCloudinary(meme.cloudinaryPublicId);
    await Meme.deleteOne({ _id: id });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('deleteMeme error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
