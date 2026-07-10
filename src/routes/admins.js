import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
// Add validation schemas if needed

const router = express.Router();

router.use(authMiddleware); // Require auth for all admin routes

router.get('/', adminController.getAdmins);
router.post('/', adminController.createAdmin);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

export default router;
