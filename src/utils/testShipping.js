import sequelize from '../config/db.js';
import MerchandiseOrder from '../models/MerchandiseOrder.js';
import MerchandiseProduct from '../models/MerchandiseProduct.js';
import PincodeMaster from '../models/PincodeMaster.js';
import { shippingService } from '../services/shipping/shippingService.js';
import fs from 'fs';
import path from 'path';

async function runTest() {
  console.log('--- Starting Automated Shipping & Pincode Master Verification ---');
  
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection authenticated.');

    // 1. Verify Pincode Master details
    console.log('Verifying pincode master table queries...');
    const testPin1 = '400070';
    const testPin2 = '400079';
    const invalidPin = '999999';

    const record1 = await PincodeMaster.findByPk(testPin1);
    if (!record1 || record1.deliveryCharge !== 100) {
      throw new Error(`Pincode master error: Pincode 400070 should exist and have a delivery charge of ₹100. Got: ${JSON.stringify(record1)}`);
    }
    console.log(`✓ Verified 400070 exists in database master with delivery charge ₹${record1.deliveryCharge}`);

    const record2 = await PincodeMaster.findByPk(testPin2);
    if (!record2 || record2.deliveryCharge !== 120) {
      throw new Error(`Pincode master error: Pincode 400079 should exist and have a delivery charge of ₹120. Got: ${JSON.stringify(record2)}`);
    }
    console.log(`✓ Verified 400079 exists in database master with delivery charge ₹${record2.deliveryCharge}`);

    const recordInvalid = await PincodeMaster.findByPk(invalidPin);
    if (recordInvalid) {
      throw new Error(`Pincode master error: Pincode 999999 should not exist or be serviceable. Got: ${JSON.stringify(recordInvalid)}`);
    }
    console.log('✓ Verified 999999 is unserviceable/non-existent.');

    // 2. Get or create a dummy product
    let product = await MerchandiseProduct.findOne();
    if (!product) {
      console.log('No products found. Creating a temporary product...');
      product = await MerchandiseProduct.create({
        name: 'Official T-Shirt',
        description: 'MCR official merchandize',
        price: 499,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: { S: 100, M: 100, L: 100 }
      });
      console.log('✓ Temporary product created.');
    }

    // 3. Test Order creation: verify backend overrides totalAmount and queries pincode master
    console.log('Creating a test order with a serviceable pincode (400070)...');
    const orderNo = `TEST-${Date.now()}`;
    
    // Simulate frontend payload sending incorrect amount (say 500, but t-shirt is 499*2 = 998 + 100 shipping = 1098)
    const { ordersService } = await import('../services/ordersService.js');
    const order = await ordersService.create({
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@example.com',
      customerPhone: '9876543210',
      address: 'Row House 4, Palm Beach Road, Sector 15, Vashi, Navi Mumbai',
      pincode: '400070',
      productName: product.name,
      productId: product.id,
      size: 'L',
      quantity: 2,
      unitPrice: product.price,
      totalAmount: 500, // Send wrong amount to verify backend ignores it
      paymentMethod: 'online',
      paymentId: 'pay_test_' + Math.random().toString(36).substring(7)
    });

    console.log(`✓ Test order created in DB. ID: ${order.id}`);
    
    // Total should be: 499 * 2 = 998 + 100 (shipping for 400070) = 1098
    const expectedAmount = (product.price * 2) + 100;
    if (order.totalAmount !== expectedAmount) {
      throw new Error(`Pricing calculation error: Expected totalAmount of ₹${expectedAmount} (Rs 998 tshirts + Rs 100 delivery), but database stored ₹${order.totalAmount}`);
    }
    console.log(`✓ Backend successfully ignored the fake ₹500 sent from frontend and recalculated the correct amount: ₹${order.totalAmount}`);

    // Verify shipping metadata contains Pincode pricing details
    if (!order.shipping || order.shipping.pincode !== '400070' || order.shipping.deliveryCharge !== 100) {
      throw new Error(`Shipping metadata error: Expected shipping block to contain pincode 400070 and delivery charge 100. Got: ${JSON.stringify(order.shipping)}`);
    }
    console.log(`✓ Verified shipping JSON block contains: Pincode: ${order.shipping.pincode}, Charge: ₹${order.shipping.deliveryCharge}, Est. Delivery: ${order.shipping.estimatedDeliveryText}`);

    // 4. Verify physical files exist on disk
    console.log('Verifying generated PDF files on disk...');
    const labelFile = path.resolve('shipping_docs', `label_${order.shipping.awb}.pdf`);
    const manifestFile = path.resolve('shipping_docs', `manifest_${order.shipping.shipmentId}.pdf`);

    if (fs.existsSync(labelFile)) {
      console.log(`✓ Shipping label PDF verified at: ${labelFile} (${fs.statSync(labelFile).size} bytes)`);
    } else {
      throw new Error(`Failed to find shipping label PDF at: ${labelFile}`);
    }

    if (fs.existsSync(manifestFile)) {
      console.log(`✓ Shipping manifest PDF verified at: ${manifestFile} (${fs.statSync(manifestFile).size} bytes)`);
    } else {
      throw new Error(`Failed to find manifest PDF at: ${manifestFile}`);
    }

    // 5. Test Live Tracking
    console.log('Testing dynamic tracking timeline...');
    const testCreatedAt = new Date(Date.now() - 26 * 60 * 60 * 1000); // 26 hours ago
    const tracking = await shippingService.trackShipment(order.shipping.awb, testCreatedAt.toISOString(), order.address);
    console.log(`✓ Computed Status (after 26 hours): ${tracking.status}`);

    // Cleanup
    console.log('Cleaning up test data...');
    const dbOrder = await MerchandiseOrder.findByPk(order.id);
    if (dbOrder) {
      await dbOrder.destroy();
    }
    if (fs.existsSync(labelFile)) fs.unlinkSync(labelFile);
    if (fs.existsSync(manifestFile)) fs.unlinkSync(manifestFile);
    console.log('✓ Test order and PDF files cleaned up.');

    console.log('\n--- ALL VERIFICATIONS PASSED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification Failed with Error:', error);
    process.exit(1);
  }
}

runTest();
