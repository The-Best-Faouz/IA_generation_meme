import { Router } from 'express';
import multer from 'multer';
import { getGifInfo, voiceEditGif } from '../controllers/gif-editor.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/info', upload.single('gif'), getGifInfo);
router.post('/voice-edit', upload.single('gif'), voiceEditGif);

export default router;
