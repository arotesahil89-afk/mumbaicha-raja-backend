import sequelize from '../config/db.js';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    console.log('Dropping foreign key constraint merchandise_orders_ibfk_1...');
    try {
      await sequelize.query('ALTER TABLE `merchandise_orders` DROP FOREIGN KEY `merchandise_orders_ibfk_1`');
      console.log('✓ Foreign key constraint dropped successfully.');
    } catch (e) {
      console.log('Constraint drop skipped (might not exist):', e.message);
    }

    console.log('Setting all productId references to NULL in merchandise_orders table...');
    await sequelize.query('UPDATE `merchandise_orders` SET `productId` = NULL');
    console.log('✓ Set productIds to NULL.');

    console.log('Dropping merchandise_products table if it exists...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS `merchandise_products`');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Done.');

    process.exit(0);
  } catch (error) {
    console.error('Failed to clear constraints:', error);
    process.exit(1);
  }
}

run();
