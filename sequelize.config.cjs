/**
 * sequelize.config.cjs
 * CommonJS config for sequelize-cli (db:migrate, db:seed:all etc.)
 *
 * Parses DATABASE_URL from .env automatically.
 *
 * Local MySQL URL format:
 *   DATABASE_URL=mysql://root:yourpassword@localhost:3306/mumbaicha_raja
 */
require('dotenv').config();

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set in .env');

const parsed = new URL(url);

const config = {
  username: parsed.username,
  password: parsed.password || null,
  database: parsed.pathname.slice(1),
  host:     parsed.hostname,
  port:     parseInt(parsed.port || '3306', 10),
  dialect:  'mysql',
  logging:  false,
  migrationStorageTableName: 'SequelizeMeta',
  seederStorage: 'sequelize',
  seederStorageTableName: 'SequelizeData',
};

module.exports = {
  development: config,
  production:  config,
  test:        config,
};
