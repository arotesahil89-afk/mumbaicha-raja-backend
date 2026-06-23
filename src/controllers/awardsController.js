import { awardsService } from '../services/awardsService.js';

export const awardsController = {
  async getAll(req, res, next) {
    try {
      const awards = await awardsService.getAll();
      res.json({
        success: true,
        data: awards,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const award = await awardsService.getById(req.params.id);
      res.json({
        success: true,
        data: award,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const award = await awardsService.create({
        ...req.validated,
        adminId: req.admin.adminId,
      });
      res.status(201).json({
        success: true,
        data: award,
        message: 'Award created successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const award = await awardsService.update(
        req.params.id,
        req.validated,
        req.admin.adminId
      );
      res.json({
        success: true,
        data: award,
        message: 'Award updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await awardsService.delete(
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
