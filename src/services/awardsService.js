import Award from '../models/Award.js';
import AuditLog from '../models/AuditLog.js';
import { groupAwardsByLanguage } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

export const awardsService = {
  async getAll() {
    const awards = await Award.findAll({
      order: [['displayOrder', 'ASC']],
    });

    const plainAwards = awards.map(a => a.toJSON());
    return groupAwardsByLanguage(plainAwards);
  },

  async getById(id) {
    const award = await Award.findByPk(id);

    if (!award) {
      throw new AppError('Award not found', 404);
    }

    return award.toJSON();
  },

  async create(data) {
    const award = await Award.create({
      language: data.language,
      text: data.text,
      heading: data.heading,
      displayOrder: data.displayOrder || 0,
    });

    const plainAward = award.toJSON();

    await AuditLog.create({
      action: 'CREATE',
      entity: 'award',
      entityId: plainAward.id,
      changes: plainAward,
      adminId: data.adminId,
    });

    return plainAward;
  },

  async update(id, data, adminId) {
    const award = await Award.findByPk(id);

    if (!award) {
      throw new AppError('Award not found', 404);
    }

    const beforeState = award.toJSON();

    await Award.update({
      language: data.language || award.language,
      text: data.text || award.text,
      heading: data.heading || award.heading,
      displayOrder: data.displayOrder !== undefined ? data.displayOrder : award.displayOrder,
    }, {
      where: { id },
    });

    const updatedAward = await Award.findByPk(id);
    const afterState = updatedAward.toJSON();

    await AuditLog.create({
      action: 'UPDATE',
      entity: 'award',
      entityId: id,
      changes: { before: beforeState, after: afterState },
      adminId,
    });

    return afterState;
  },

  async delete(id, adminId) {
    const award = await Award.findByPk(id);

    if (!award) {
      throw new AppError('Award not found', 404);
    }

    const beforeState = award.toJSON();

    await Award.destroy({
      where: { id },
    });

    await AuditLog.create({
      action: 'DELETE',
      entity: 'award',
      entityId: id,
      changes: beforeState,
      adminId,
    });

    return { message: 'Award deleted successfully' };
  },
};
