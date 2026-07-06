import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import crypto from 'crypto';

const MerchandiseProduct = sequelize.define('MerchandiseProduct', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    defaultValue: () => crypto.randomUUID(),
  },
  name: {
    type: DataTypes.JSON, // Support multilingual name object
    allowNull: false,
  },
  tagline: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  description: {
    type: DataTypes.JSON, // Support multilingual description object
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  oldPrice: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sizes: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  stock: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  colorName: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT, // Store base64 data or image url
    allowNull: true,
  },
  gallery: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 4.8,
  },
  reviews: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  highlights: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  specs: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'merchandise_products',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

export default MerchandiseProduct;
