import 'dotenv/config';

/**
 * Sequelize CLI configuration
 * Used by: npx sequelize-cli db:migrate / db:seed:all
 *
 * DATABASE_URL format for local MySQL:
 *   mysql://root:password@localhost:3306/mumbaicha_raja
 */

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Parse mysql://user:pass@host:port/dbname
const parsed = new URL(url);

const config = {
  username: parsed.username,
  password: parsed.password || null,
  database: parsed.pathname.slice(1), // remove leading "/"
  host:     parsed.hostname,
  port:     parseInt(parsed.port || '3306', 10),
  dialect:  'mysql',
  logging:  false,
  migrationStorageTableName: 'SequelizeMeta',
  seederStorage: 'sequelize',
  seederStorageTableName: 'SequelizeData',
  define: {
    timestamps: true,
  },
};

export default config;
// CommonJS-compatible export (required by sequelize-cli)
module.exports = { development: config, production: config, test: config };
