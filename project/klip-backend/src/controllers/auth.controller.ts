import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateTokens = (userId: string) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, country, language } = req.body;

    if (!email || !password || !country || !language) {
      res.status(400).json({ error: 'Tous les champs sont requis' });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Format d\'email invalide' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ error: 'Email déjà utilisé' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      country,
      language,
    });

    const { token, refreshToken } = generateTokens(user._id.toString());
    const hashedRefresh = await bcrypt.hash(refreshToken, 12);
    user.refreshToken = hashedRefresh;

    await user.save();

    res.status(201).json({
      user: { id: user._id, email: user.email, country: user.country, language: user.language },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur serveur. Réessaie dans quelques secondes.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis' });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Format d\'email invalide' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ error: 'Identifiants incorrects' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Identifiants incorrects' });
      return;
    }

    const { token, refreshToken } = generateTokens(user._id.toString());
    const hashedRefresh = await bcrypt.hash(refreshToken, 12);
    user.refreshToken = hashedRefresh;
    await user.save();

    res.status(200).json({
      user: { id: user._id, email: user.email },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur serveur. Réessaie dans quelques secondes.' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token manquant' });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'Utilisateur introuvable' });
      return;
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      res.status(401).json({ error: 'Refresh token invalide' });
      return;
    }

    const newToken = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Refresh token invalide ou expiré' });
  }
};
