import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';
import { upload } from '../middleware/upload.middleware';
import { generateFromText, generateFromImage, generateFromPrompt } from '../controllers/meme.controller';

const router = Router();

router.post('/text', authMiddleware, aiRateLimiter, generateFromText);
router.post('/image', authMiddleware, aiRateLimiter, upload.single('image'), generateFromImage);
router.post('/prompt', authMiddleware, aiRateLimiter, generateFromPrompt);

export default router;
