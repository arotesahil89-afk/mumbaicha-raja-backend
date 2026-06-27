import sequelize from '../config/db.js';

async function checkTable() {
  try {
    await sequelize.authenticate();
    console.log('Database connection OK.');
    const [results] = await sequelize.query('DESCRIBE merchandise_orders;');
    console.log('Columns in merchandise_orders:');
    console.log(results);
    process.exit(0);
  } catch (error) {
    console.error('Error listing table columns:', error);
    process.exit(1);
  }
}

checkTable();
