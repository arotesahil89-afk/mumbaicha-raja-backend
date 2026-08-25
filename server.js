import app from './src/app.js';
import sequelize from './src/config/db.js';

// Import all models to ensure schemas are registered
import './src/models/Admin.js';
import './src/models/Award.js';
import './src/models/Event.js';
import './src/models/AuditLog.js';
import './src/models/MerchandiseProduct.js';
import './src/models/MerchandiseOrder.js';
import './src/models/Donation.js';

const PORT = process.env.PORT || 5000;

// Test DB connection and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection has been established successfully.');

    // Safe sync creates any missing tables (e.g. donations) without altering existing tables
    await sequelize.sync();
    console.log('✓ Database tables synchronized successfully (Safe Sync).');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📧 Admin Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`🏆 Awards API: GET/POST/PUT/DELETE http://localhost:${PORT}/api/awards`);
      console.log(`📅 Events API: GET/POST/PUT/DELETE http://localhost:${PORT}/api/events`);
      console.log(`❤️ Donations API: GET/POST http://localhost:${PORT}/api/donations`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} signal received: closing HTTP server`);
      server.close(async () => {
        console.log('HTTP server closed');
        await sequelize.close();
        console.log('Database connection closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
