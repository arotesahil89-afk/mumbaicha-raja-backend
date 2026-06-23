import express from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validationMiddleware } from '../middleware/validationMiddleware.js';
import { loginSchema } from '../utils/validationSchemas.js';

const router = express.Router();

// POST /api/auth/login
router.post(
  '/login',
  validationMiddleware(loginSchema),
  authController.login
);

// GET /api/auth/verify
router.get(
  '/verify',
  authMiddleware,
  authController.verify
);

// POST /api/auth/logout
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

export default router;
