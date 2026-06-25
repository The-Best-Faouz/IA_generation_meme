import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';
import { upload } from '../middleware/upload.middleware';
import { generateGif } from '../controllers/gif.controller';

const router = Router();

router.post('/gif', authMiddleware, aiRateLimiter, upload.fields([
  { name: 'gif', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]), generateGif);

export default router;
