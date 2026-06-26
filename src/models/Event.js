import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import crypto from 'crypto';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    defaultValue: () => crypto.randomUUID(),
  },
  titleEn: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  titleHi: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  titleMr: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  descriptionEn: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  descriptionHi: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  descriptionMr: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  eventTime: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
}, {
  tableName: 'events',
  timestamps: true,
  indexes: [
    {
      fields: ['eventDate'],
    },
  ],
});

export default Event;
