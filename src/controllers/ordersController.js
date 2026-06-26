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
      const { status, search, page, limit } = req.query;
      const result = await ordersService.getAll({ status, search, page, limit });
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
      const { status, notes } = req.validated;
      const adminId = req.admin?.adminId;
      const updated = await ordersService.updateStatus(req.params.id, status, notes, adminId);
      res.json({
        success: true,
        data:    updated,
        message: 'Order status updated',
      });
    } catch (error) {
      next(error);
    }
  },
};
