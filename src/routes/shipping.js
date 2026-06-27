import express from 'express';
import { shippingController } from '../controllers/shippingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Trigger routes
router.post('/create', shippingController.create);
router.get('/track/:awb', shippingController.track);
router.get('/status/:awb', shippingController.status);

// Pincode Verification (Public)
router.get('/pincode/:pincode', shippingController.checkPincode);

// PDF Downloads (public links for easy browser opening)
router.get('/label/:awb', shippingController.label);
router.get('/manifest/:id', shippingController.manifest);

// Admin-protected routes
router.post('/cancel', authMiddleware, shippingController.cancel);

// Pincode Master CRUD (Admin protected)
router.get('/pincodes', authMiddleware, shippingController.listPincodes);
router.post('/pincodes', authMiddleware, shippingController.createPincode);
router.put('/pincodes/:pincode', authMiddleware, shippingController.updatePincode);
router.delete('/pincodes/:pincode', authMiddleware, shippingController.deletePincode);

export default router;
