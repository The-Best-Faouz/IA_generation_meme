import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { connectBot, getMessages, sendMessage } from '../controllers/telegram.controller';

const router = Router();

router.post('/connect', authMiddleware, connectBot);
router.get('/messages', authMiddleware, getMessages);
router.post('/send', authMiddleware, sendMessage);

export default router;
