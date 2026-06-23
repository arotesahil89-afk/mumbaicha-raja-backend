import express from 'express';
import { eventsController } from '../controllers/eventsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validationMiddleware } from '../middleware/validationMiddleware.js';
import { createEventSchema, updateEventSchema } from '../utils/validationSchemas.js';

const router = express.Router();

// GET /api/events
router.get('/', eventsController.getAll);

// GET /api/events/:id
router.get('/:id', eventsController.getById);

// POST /api/events (admin only)
router.post(
  '/',
  authMiddleware,
  validationMiddleware(createEventSchema),
  eventsController.create
);

// PUT /api/events/:id (admin only)
router.put(
  '/:id',
  authMiddleware,
  validationMiddleware(updateEventSchema),
  eventsController.update
);

// DELETE /api/events/:id (admin only)
router.delete(
  '/:id',
  authMiddleware,
  eventsController.delete
);

export default router;
