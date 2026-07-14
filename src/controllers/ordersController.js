import { ordersService } from '../services/ordersService.js';

export const ordersController = {
  // POST /api/orders  (public — called from frontend after payment)
  async create(req, res, next) {
    try {
      const order = await ordersService.create(req.validated);
      res.status(201).json({
        success: true,
        data:    order,
        message: 'Order placed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders  (admin only)
  async getAll(req, res, next) {
    try {
      const { status, deliveryMethod, dateFilter, customDate, search, page, limit } = req.query;
      const result = await ordersService.getAll({ status, deliveryMethod, dateFilter, customDate, search, page, limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/stats  (admin only)
  async getStats(req, res, next) {
    try {
      const stats = await ordersService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/:id  (admin only)
  async getById(req, res, next) {
    try {
      const order = await ordersService.getById(req.params.id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/orders/:id/status  (admin only)
  async updateStatus(req, res, next) {
    try {
      const { status, notes, items, otp } = req.validated;
      const adminId = req.admin?.adminId;
      const updated = await ordersService.updateStatus(req.params.id, status, notes, adminId, items, otp);
      res.json({
        success: true,
        data:    updated,
        message: 'Order status updated',
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/:id/send-otp  (admin only)
  async sendOTP(req, res, next) {
    try {
      const result = await ordersService.sendOTP(req.params.id);
      res.json({
        success: true,
        message: 'OTP verification code sent successfully (Simulated)',
        otp: result.otp,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/:id/verify-payment  (admin only)
  async verifyPayment(req, res, next) {
    try {
      const result = await ordersService.verifyPayment(req.params.id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },
};
