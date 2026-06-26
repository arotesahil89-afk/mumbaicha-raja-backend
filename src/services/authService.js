import Admin from '../models/Admin.js';
import { comparePassword, generateToken, hashPassword } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

export const authService = {
  async login(email, password) {
    const admin = await Admin.findOne({
      where: { email },
    });

    if (!admin || !admin.active) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(admin.id);
    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  },

  async verify(adminId) {
    const admin = await Admin.findByPk(adminId, {
      attributes: ['id', 'email', 'role', 'active'],
    });

    if (!admin || !admin.active) {
      throw new AppError('Admin not found or inactive', 401);
    }

    return admin.toJSON(); // Return plain object matching prisma output
  },

  async logout() {
    // JWT logout - token validation happens in middleware
    return { message: 'Logged out successfully' };
  },

  async changePassword(adminId, oldPassword, newPassword) {
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    const isPasswordValid = await comparePassword(oldPassword, admin.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const hashedPassword = await hashPassword(newPassword);
    await Admin.update(
      { password: hashedPassword },
      { where: { id: adminId } }
    );

    return { message: 'Password changed successfully' };
  },
};
