/**
 * migrate.js
 * Creates / updates all database tables based on Sequelize model definitions.
 *
 * Usage:
 *   node src/scripts/migrate.js           → safe sync (CREATE TABLE IF NOT EXISTS)
 *   node src/scripts/migrate.js --alter   → alter existing tables to match models
 *   node src/scripts/migrate.js --force   → DROP + recreate all tables  ⚠️  destructive!
 */

import '../models/Admin.js';
import '../models/Award.js';
import '../models/Event.js';
import '../models/AuditLog.js';
import '../models/MerchandiseProduct.js';
import '../models/MerchandiseOrder.js';   // must come after MerchandiseProduct (FK dep)

import sequelize from '../config/db.js';

const args  = process.argv.slice(2);
const alter = args.includes('--alter');
const force = args.includes('--force');

async function migrate() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✓  Connection established.\n');

    if (force) {
      console.warn('⚠️  --force flag detected. ALL TABLES WILL BE DROPPED AND RECREATED.');
      console.warn('    You have 5 seconds to cancel (Ctrl+C)...\n');
      await new Promise(r => setTimeout(r, 5000));
    }

    const syncOptions = force ? { force: true } : alter ? { alter: true } : {};
    const modeLabel   = force ? 'FORCE (drop+create)' : alter ? 'ALTER' : 'SAFE (no destructive changes)';

    console.log(`📦 Running migration in ${modeLabel} mode...`);
    await sequelize.sync(syncOptions);

    console.log('\n✅ Migration complete. Tables created/updated:');
    console.log('   • admins');
    console.log('   • awards');
    console.log('   • events');
    console.log('   • audit_logs');
    console.log('   • merchandise_products');
    console.log('   • pincode_masters');
    console.log('   • merchandise_orders');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
