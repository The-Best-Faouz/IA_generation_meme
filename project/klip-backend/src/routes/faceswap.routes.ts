import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';
import { upload } from '../middleware/upload.middleware';
import { faceSwap } from '../controllers/faceswap.controller';

const router = Router();

router.post('/faceswap', authMiddleware, aiRateLimiter, upload.fields([
  { name: 'source', maxCount: 1 },
  { name: 'face', maxCount: 1 },
]), faceSwap);

export default router;
