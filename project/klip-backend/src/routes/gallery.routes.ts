import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getGallery, getMemeDetail, deleteMeme } from '../controllers/gallery.controller';

const router = Router();

router.get('/', authMiddleware, getGallery);
router.get('/:id', authMiddleware, getMemeDetail);
router.delete('/:id', authMiddleware, deleteMeme);

export default router;
