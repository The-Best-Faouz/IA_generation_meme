import { Router } from 'express';
import { analyzeMessages, analyzeNotifications } from '../controllers/notification.controller';

const router = Router();

router.post('/analyze-messages', analyzeMessages);
router.post('/analyze-notifications', analyzeNotifications);

export default router;
