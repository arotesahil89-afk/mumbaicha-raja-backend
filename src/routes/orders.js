import express from 'express';
import { ordersController } from '../controllers/ordersController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validationMiddleware } from '../middleware/validationMiddleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../utils/validationSchemas.js';

const router = express.Router();

// POST /api/orders  — public (called after payment success)
router.post(
  '/',
  validationMiddleware(createOrderSchema),
  ordersController.create
);

// GET /api/orders  — admin only
router.get(
  '/',
  authMiddleware,
  ordersController.getAll
);

// GET /api/orders/stats  — admin only
router.get(
  '/stats',
  authMiddleware,
  ordersController.getStats
);

// GET /api/orders/:id  — admin only
router.get(
  '/:id',
  authMiddleware,
  ordersController.getById
);

// PATCH /api/orders/:id/status  — admin only
router.patch(
  '/:id/status',
  authMiddleware,
  validationMiddleware(updateOrderStatusSchema),
  ordersController.updateStatus
);

export default router;
