import { Response } from 'express';
import { User } from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }

    const totalMemes = 0;

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        country: user.country,
        language: user.language,
        totalMemes,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { country, language } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { ...(country && { country }), ...(language && { language }) },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
