import Event from '../models/Event.js';
import AuditLog from '../models/AuditLog.js';
import { groupEventsByLanguage } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

export const eventsService = {
  async getAll() {
    const events = await Event.findAll({
      order: [['eventDate', 'ASC']],
    });

    const plainEvents = events.map(e => e.toJSON());
    return groupEventsByLanguage(plainEvents);
  },

  async getById(id) {
    const event = await Event.findByPk(id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return groupEventsByLanguage([event.toJSON()])[0];
  },

  async create(data) {
    console.log("EVENT DATA RECEIVED:", JSON.stringify(data, null, 2));

    const event = await Event.create({
      titleEn: data.title?.en,
      titleHi: data.title?.hi,
      titleMr: data.title?.mr,

      descriptionEn: data.description?.en,
      descriptionHi: data.description?.hi,
      descriptionMr: data.description?.mr,

      eventDate: new Date(data.date),
      eventTime: data.time,
    });

    const plainEvent = event.toJSON();

    await AuditLog.create({
      action: 'CREATE',
      entity: 'event',
      entityId: plainEvent.id,
      changes: plainEvent,
      adminId: data.adminId,
    });

    return groupEventsByLanguage([plainEvent])[0];
  },

  async update(id, data, adminId) {
    const event = await Event.findByPk(id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const beforeState = event.toJSON();

    await Event.update({
      titleEn: data.title?.en || event.titleEn,
      titleHi: data.title?.hi || event.titleHi,
      titleMr: data.title?.mr || event.titleMr,
      descriptionEn: data.description?.en || event.descriptionEn,
      descriptionHi: data.description?.hi || event.descriptionHi,
      descriptionMr: data.description?.mr || event.descriptionMr,
      eventDate: (data.date || data.eventDate) ? new Date(data.date || data.eventDate) : event.eventDate,
      eventTime: data.time || data.eventTime || event.eventTime,
    }, {
      where: { id },
    });

    const updatedEvent = await Event.findByPk(id);
    const afterState = updatedEvent.toJSON();

    await AuditLog.create({
      action: 'UPDATE',
      entity: 'event',
      entityId: id,
      changes: { before: beforeState, after: afterState },
      adminId,
    });

    return groupEventsByLanguage([afterState])[0];
  },

  async delete(id, adminId) {
    const event = await Event.findByPk(id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const beforeState = event.toJSON();

    await Event.destroy({
      where: { id },
    });

    await AuditLog.create({
      action: 'DELETE',
      entity: 'event',
      entityId: id,
      changes: beforeState,
      adminId,
    });

    return { message: 'Event deleted successfully' };
  },
};
