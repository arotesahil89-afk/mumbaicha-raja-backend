import { PrismaClient } from '@prisma/client';
import { comparePassword, generateToken, hashPassword } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const authService = {
  async login(email, password) {
    const admin = await prisma.admin.findUnique({
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
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, role: true, active: true },
    });

    if (!admin || !admin.active) {
      throw new AppError('Admin not found or inactive', 401);
    }

    return admin;
  },

  async logout() {
    // JWT logout - token validation happens in middleware
    return { message: 'Logged out successfully' };
  },

  async changePassword(adminId, oldPassword, newPassword) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    const isPasswordValid = await comparePassword(oldPassword, admin.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  },
};
