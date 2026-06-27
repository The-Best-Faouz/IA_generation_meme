import { Router } from 'express';
import multer from 'multer';
import {
  processStickerAction,
  swapFaceOnStickerAction,
  addTextToStickerAction,
} from '../controllers/sticker.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/process', upload.single('sticker'), processStickerAction);
router.post('/faceswap', swapFaceOnStickerAction);
router.post('/add-text', addTextToStickerAction);

export default router;
