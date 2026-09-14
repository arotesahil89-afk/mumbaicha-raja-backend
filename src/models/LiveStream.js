import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import crypto from 'crypto';

const LiveStream = sequelize.define('LiveStream', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    defaultValue: () => crypto.randomUUID(),
  },
  youtubeUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    defaultValue: 'https://www.youtube.com/watch?v=9ThLarUCcas',
  },
  videoId: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: '9ThLarUCcas',
  },
  isLive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Mumbai Cha Raja Live',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  targetDate: {
    type: DataTypes.STRING(191),
    allowNull: true,
    defaultValue: '2025-08-27T08:00:00+05:30',
  },
}, {
  tableName: 'live_stream',
  timestamps: true,
});

export default LiveStream;
