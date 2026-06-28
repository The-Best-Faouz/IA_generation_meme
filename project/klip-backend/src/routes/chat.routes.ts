import { Router } from 'express';
import { parseChat, generateMemesFromChat } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/parse', authMiddleware, parseChat);
router.post('/generate-memes', authMiddleware, aiRateLimiter, generateMemesFromChat);

export default router;
