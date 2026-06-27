import { Router } from 'express';
import { parseChat, generateMemesFromChat } from '../controllers/chat.controller';

const router = Router();

router.post('/parse', parseChat);
router.post('/generate-memes', generateMemesFromChat);

export default router;
