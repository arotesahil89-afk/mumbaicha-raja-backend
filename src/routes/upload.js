import { Router } from 'express';
import { uploadController } from '../controllers/uploadController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/upload - Upload an image (base64 payload with magic bytes validation)
router.post('/', optionalAuth, uploadController.uploadImage);

export default router;
