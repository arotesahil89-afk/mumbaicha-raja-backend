import express from 'express';
import { donationsController } from '../controllers/donationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validationMiddleware } from '../middleware/validationMiddleware.js';
import {
  sendDonationOtpSchema,
  verifyDonationOtpSchema,
  initiateDonationSchema,
} from '../utils/validationSchemas.js';

const router = express.Router();

// ─── Public Endpoints ────────────────────────────────────────────────────────

// POST /api/donations/send-otp
router.post(
  '/send-otp',
  validationMiddleware(sendDonationOtpSchema),
  donationsController.sendOTP
);

// POST /api/donations/verify-otp
router.post(
  '/verify-otp',
  validationMiddleware(verifyDonationOtpSchema),
  donationsController.verifyOTP
);

// POST /api/donations/initiate
router.post(
  '/initiate',
  validationMiddleware(initiateDonationSchema),
  donationsController.initiate
);

// POST & GET /api/donations/ccavenue-response (CCAvenue webhook / redirect callback)
router.post('/ccavenue-response', donationsController.ccavenueResponse);
router.get('/ccavenue-response', donationsController.ccavenueResponse);

// GET /api/donations/pavati/:id (public receipt download)
router.get('/pavati/:id', donationsController.getPavati);

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

// GET /api/donations/stats
router.get('/stats', authMiddleware, donationsController.getStats);

// GET /api/donations (list all with filters)
router.get('/', authMiddleware, donationsController.getAll);

// GET /api/donations/:id
router.get('/:id', authMiddleware, donationsController.getById);

// POST /api/donations/:id/resend-sms
router.post('/:id/resend-sms', authMiddleware, donationsController.resendSMS);

export default router;
