import sequelize from '../config/db.js';
import '../models/MerchandiseOrder.js'; // Ensure the model is loaded
import PincodeMaster from '../models/PincodeMaster.js';

async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection authenticated.');
    console.log('Syncing database schema (altering table)...');
    await sequelize.sync({ alter: true });
    console.log('✓ Database schema synced successfully.');

    console.log('Seeding initial pincode master rates...');
    const seedData = [
      { pincode: '400070', city: 'Mumbai', state: 'Maharashtra', deliveryCharge: 100, estimatedDelivery: '2-3 Days', active: true },
      { pincode: '400079', city: 'Mumbai', state: 'Maharashtra', deliveryCharge: 120, estimatedDelivery: '2-3 Days', active: true },
      { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', deliveryCharge: 80, estimatedDelivery: '1-2 Days', active: true },
      { pincode: '411001', city: 'Pune', state: 'Maharashtra', deliveryCharge: 150, estimatedDelivery: '3-4 Days', active: true },
      { pincode: '400012', city: 'Mumbai', state: 'Maharashtra', deliveryCharge: 50, estimatedDelivery: '1-2 Days', active: true },
    ];

    for (const item of seedData) {
      await PincodeMaster.findOrCreate({
        where: { pincode: item.pincode },
        defaults: item,
      });
    }
    console.log('✓ Pincode master rates seeded successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

syncDb();
