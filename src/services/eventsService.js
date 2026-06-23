import { PrismaClient } from '@prisma/client';
import { groupEventsByLanguage } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const eventsService = {
  async getAll() {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'asc' },
    });

    return groupEventsByLanguage(events);
  },

  async getById(id) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return groupEventsByLanguage([event])[0];
  },

  async create(data) {
    const event = await prisma.event.create({
      data: {
        titleEn: data.titleEn,
        titleHi: data.titleHi,
        titleMr: data.titleMr,
        descriptionEn: data.descriptionEn,
        descriptionHi: data.descriptionHi,
        descriptionMr: data.descriptionMr,
        eventDate: new Date(data.eventDate),
        eventTime: data.eventTime,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'event',
        entityId: event.id,
        changes: event,
        adminId: data.adminId,
      },
    });

    return groupEventsByLanguage([event])[0];
  },

  async update(id, data, adminId) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        titleEn: data.titleEn || event.titleEn,
        titleHi: data.titleHi || event.titleHi,
        titleMr: data.titleMr || event.titleMr,
        descriptionEn: data.descriptionEn || event.descriptionEn,
        descriptionHi: data.descriptionHi || event.descriptionHi,
        descriptionMr: data.descriptionMr || event.descriptionMr,
        eventDate: data.eventDate ? new Date(data.eventDate) : event.eventDate,
        eventTime: data.eventTime || event.eventTime,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'event',
        entityId: id,
        changes: { before: event, after: updatedEvent },
        adminId,
      },
    });

    return groupEventsByLanguage([updatedEvent])[0];
  },

  async delete(id, adminId) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    await prisma.event.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'event',
        entityId: id,
        changes: event,
        adminId,
      },
    });

    return { message: 'Event deleted successfully' };
  },
};
