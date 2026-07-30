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

// POST /api/orders/ccavenue-initiate — public (called to start payment)
router.post(
  '/ccavenue-initiate',
  validationMiddleware(createOrderSchema),
  ordersController.ccavenueInitiate
);

// POST /api/orders/ccavenue-response — public (callback from CCAvenue)
router.post(
  '/ccavenue-response',
  ordersController.ccavenueResponse
);

// POST /api/orders/ccavenue-simulator — public (mock gateway simulator)
router.post(
  '/ccavenue-simulator',
  ordersController.ccavenueSimulator
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

// POST /api/orders/:id/verify-payment  — admin only
router.post(
  '/:id/verify-payment',
  authMiddleware,
  ordersController.verifyPayment
);

// POST /api/orders/:id/send-otp  — admin only
router.post(
  '/:id/send-otp',
  authMiddleware,
  ordersController.sendOTP
);

export default router;
