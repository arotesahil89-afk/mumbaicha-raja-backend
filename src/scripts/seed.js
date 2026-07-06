/**
 * seed.js
 * Seeds the database with the initial admin account.
 *
 * Reads credentials from .env:
 *   INITIAL_ADMIN_EMAIL    — defaults to admin@mumbaicharaja.com
 *   INITIAL_ADMIN_PASSWORD — must be set; no default for security
 *
 * Safe to run multiple times — skips if admin already exists.
 *
 * Usage:
 *   node src/scripts/seed.js
 */
import dotenv from 'dotenv';
dotenv.config();
import sequelize    from '../config/db.js';
import Admin        from '../models/Admin.js';
import { hashPassword } from '../utils/helpers.js';
// ─── Load credentials from .env ────────────────────────────────────────────
const ADMIN_EMAIL    = process.env.INITIAL_ADMIN_EMAIL    || 'admin@mumbaicharaja.com';
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('❌ INITIAL_ADMIN_PASSWORD is not set in .env');
  console.error('   Add it to your .env file and re-run:');
  console.error('   INITIAL_ADMIN_PASSWORD=YourSecurePassword123!');
  process.exit(1);
}
async function seed() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✓  Connection established.\n');
    // ── Admin ────────────────────────────────────────────────────────────────
    const existingAdmin = await Admin.findOne({ where: { email: ADMIN_EMAIL } });
    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL} — skipping.`);
    } else {
      const hashedPassword = await hashPassword(ADMIN_PASSWORD);
      await Admin.create({
        email:    ADMIN_EMAIL,
        password: hashedPassword,
        role:     'admin',
        active:   true,
      });
      console.log(`✅ Admin created:`);
      console.log(`   Email   : ${ADMIN_EMAIL}`);
      console.log(`   Password: (from INITIAL_ADMIN_PASSWORD in .env)`);
      console.log(`   Role    : admin`);
    }
    console.log('\n🌱 Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}
seed();
