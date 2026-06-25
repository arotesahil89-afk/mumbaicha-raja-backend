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
  console.log("EVENT DATA RECEIVED:", JSON.stringify(data, null, 2));

  const event = await prisma.event.create({
    data: {
      titleEn: data.title?.en,
      titleHi: data.title?.hi,
      titleMr: data.title?.mr,

      descriptionEn: data.description?.en,
      descriptionHi: data.description?.hi,
      descriptionMr: data.description?.mr,

      eventDate: new Date(data.date),
      eventTime: data.time,
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
        titleEn: data.title.en || event.title.en,
        titleHi: data.title.hi || event.title.hi,
        titleMr: data.title.mr || event.title.mr,
        descriptionEn: data.description.en || event.description.en,
        descriptionHi: data.description.hi || event.description.hi,
        descriptionMr: data.description.mr || event.description.mr,
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
