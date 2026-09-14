import express from 'express';
import { liveStreamController } from '../controllers/liveStreamController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/live-stream (public)
router.get('/', liveStreamController.get);

// PUT /api/live-stream (admin only)
router.put('/', authMiddleware, liveStreamController.update);

export default router;
