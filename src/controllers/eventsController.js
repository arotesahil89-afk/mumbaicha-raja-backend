import { eventsService } from '../services/eventsService.js';

export const eventsController = {
  async getAll(req, res, next) {
    try {
      const events = await eventsService.getAll();
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const event = await eventsService.getById(req.params.id);
      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const event = await eventsService.create({
        ...req.validated,
        adminId: req.admin.adminId,
      });
      res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const event = await eventsService.update(
        req.params.id,
        req.validated,
        req.admin.adminId
      );
      res.json({
        success: true,
        data: event,
        message: 'Event updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await eventsService.delete(
        req.params.id,
        req.admin.adminId
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
