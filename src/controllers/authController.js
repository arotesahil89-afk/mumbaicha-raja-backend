import { authService } from '../services/authService.js';

export const authController = {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.validated.email, req.validated.password);
      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  },

  async verify(req, res, next) {
    try {
      const admin = await authService.verify(req.admin.adminId);
      res.json({
        success: true,
        data: admin,
        message: 'Token is valid',
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const result = await authService.logout();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const result = await authService.changePassword(
        req.admin.adminId,
        req.validated.oldPassword,
        req.validated.newPassword
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
