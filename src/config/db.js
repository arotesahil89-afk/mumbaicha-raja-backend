import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  logging: false, // Set to console.log if query debugging is needed
  define: {
    timestamps: true, // Manages createdAt and updatedAt
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
