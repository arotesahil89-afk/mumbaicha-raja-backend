import sequelize from '../config/db.js';
import MerchandiseOrder from '../models/MerchandiseOrder.js';

async function updateOrders() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const orders = await MerchandiseOrder.findAll();
    console.log(`Found ${orders.length} orders in the database.`);

    let updatedCount = 0;
    for (const order of orders) {
      const subtotal = Number(order.quantity || 0) * Number(order.unitPrice || 0);
      
      // Determine delivery charge from saved shipping JSON if present
      let deliveryCharge = 0;
      if (order.paymentMethod !== 'pickup' && order.shipping) {
        const shippingData = typeof order.shipping === 'string' 
          ? JSON.parse(order.shipping) 
          : order.shipping;
        deliveryCharge = Number(shippingData.deliveryCharge || 0);
      }
      
      const baseTotal = subtotal + deliveryCharge;
      const fee = order.paymentMethod === 'pickup' ? 19 : Math.round(baseTotal * 0.02);
      const expectedTotal = baseTotal + fee;

      if (Number(order.totalAmount) !== expectedTotal) {
        console.log(`Updating ${order.orderNo}: Current total = ₹${order.totalAmount}, Correct total = ₹${expectedTotal} (Subtotal = ₹${subtotal}, Delivery = ₹${deliveryCharge}, Fee = ₹${fee})`);
        await order.update({ totalAmount: expectedTotal });
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} orders.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

updateOrders();
