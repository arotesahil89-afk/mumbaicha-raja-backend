import express from 'express';
import { awardsController } from '../controllers/awardsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validationMiddleware } from '../middleware/validationMiddleware.js';
import { createAwardSchema, updateAwardSchema } from '../utils/validationSchemas.js';

const router = express.Router();

// GET /api/awards
router.get('/', awardsController.getAll);

// GET /api/awards/:id
router.get('/:id', awardsController.getById);

// POST /api/awards (admin only)
router.post(
  '/',
  authMiddleware,
  validationMiddleware(createAwardSchema),
  awardsController.create
);

// PUT /api/awards/:id (admin only)
router.put(
  '/:id',
  authMiddleware,
  validationMiddleware(updateAwardSchema),
  awardsController.update
);

// DELETE /api/awards/:id (admin only)
router.delete(
  '/:id',
  authMiddleware,
  awardsController.delete
);

export default router;
