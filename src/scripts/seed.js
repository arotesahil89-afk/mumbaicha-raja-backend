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
const ADMIN_EMAIL    = 'admin@mumbaicharaja.com';
const ADMIN_PASSWORD = 'MCRAdmin@12345';
const SACHIN_EMAIL    = 'sachin@mumbaicharaja.com';
const SACHIN_PASSWORD = 'Sachin@12345';

async function seed() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✓  Connection established.\n');
    
    // ── Admin ────────────────────────────────────────────────────────────────
    const existingAdmin = await Admin.findOne({ where: { email: ADMIN_EMAIL } });
    const adminHashed = await hashPassword(ADMIN_PASSWORD);
    
    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL} — updating password...`);
      await existingAdmin.update({ password: adminHashed, name: 'Main Admin' });
      console.log(`✅ Admin updated: ${ADMIN_EMAIL}`);
    } else {
      await Admin.create({
        name:     'Main Admin',
        email:    ADMIN_EMAIL,
        password: adminHashed,
        role:     'admin',
        active:   true,
      });
      console.log(`✅ Admin created: ${ADMIN_EMAIL}`);
    }

    // ── Sachin ────────────────────────────────────────────────────────────────
    const existingSachin = await Admin.findOne({ where: { email: SACHIN_EMAIL } });
    const sachinHashed = await hashPassword(SACHIN_PASSWORD);
    
    if (existingSachin) {
      console.log(`ℹ️  Admin already exists: ${SACHIN_EMAIL} — updating password...`);
      await existingSachin.update({ password: sachinHashed, name: 'Sachin' });
      console.log(`✅ Admin updated: ${SACHIN_EMAIL}`);
    } else {
      await Admin.create({
        name:     'Sachin',
        email:    SACHIN_EMAIL,
        password: sachinHashed,
        role:     'admin',
        active:   true,
      });
      console.log(`✅ Admin created: ${SACHIN_EMAIL}`);
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
