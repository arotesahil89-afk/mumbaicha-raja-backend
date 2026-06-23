import { PrismaClient } from '@prisma/client';
import { groupAwardsByLanguage } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const awardsService = {
  async getAll() {
    const awards = await prisma.award.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return groupAwardsByLanguage(awards);
  },

  async getById(id) {
    const award = await prisma.award.findUnique({
      where: { id },
    });

    if (!award) {
      throw new AppError('Award not found', 404);
    }

    return award;
  },

  async create(data) {
    const award = await prisma.award.create({
      data: {
        language: data.language,
        text: data.text,
        heading: data.heading,
        displayOrder: data.displayOrder || 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'award',
        entityId: award.id,
        changes: award,
        adminId: data.adminId,
      },
    });

    return award;
  },

  async update(id, data, adminId) {
    const award = await prisma.award.findUnique({
      where: { id },
    });

    if (!award) {
      throw new AppError('Award not found', 404);
    }

    const updatedAward = await prisma.award.update({
      where: { id },
      data: {
        language: data.language || award.language,
        text: data.text || award.text,
        heading: data.heading || award.heading,
        displayOrder: data.displayOrder !== undefined ? data.displayOrder : award.displayOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'award',
        entityId: id,
        changes: { before: award, after: updatedAward },
        adminId,
      },
    });

    return updatedAward;
  },

  async delete(id, adminId) {
    const award = await prisma.award.findUnique({
      where: { id },
    });

    if (!award) {
      throw new AppError('Award not found', 404);
    }

    await prisma.award.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'award',
        entityId: id,
        changes: award,
        adminId,
      },
    });

    return { message: 'Award deleted successfully' };
  },
};
