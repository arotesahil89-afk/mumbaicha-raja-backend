import sequelize from '../config/db.js';

async function run() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SHOW CREATE TABLE `merchandise_orders`");
    console.log(results[0]['Create Table']);
    process.exit(0);
  } catch (error) {
    console.error('Error fetching table info:', error);
    process.exit(1);
  }
}

run();
