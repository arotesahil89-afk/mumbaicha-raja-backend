import sequelize from '../config/db.js';
import '../models/MerchandiseOrder.js'; // Ensure the model is loaded

async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection authenticated.');
    console.log('Syncing database schema (altering table)...');
    await sequelize.sync({ alter: true });
    console.log('✓ Database schema synced successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

syncDb();
