import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import crypto from 'crypto';

const Award = sequelize.define('Award', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    defaultValue: () => crypto.randomUUID(),
  },
  language: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  heading: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'awards',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['language', 'text'],
    },
  ],
});

export default Award;
