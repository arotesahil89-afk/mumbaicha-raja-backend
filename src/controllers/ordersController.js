import { Op } from 'sequelize';
import { ordersService } from '../services/ordersService.js';
import MerchandiseOrder from '../models/MerchandiseOrder.js';
import MerchandiseProduct from '../models/MerchandiseProduct.js';
import { shippingService } from '../services/shipping/shippingService.js';
import { encrypt, decrypt } from '../utils/ccavutil.js';
import { getCCAvenueConfig } from '../utils/ccavenueConfig.js';


export const ordersController = {
  // GET /api/orders/pavati/:id  (public — called by SMS link page)
  async getPavati(req, res, next) {
    try {
      const { id } = req.params;
      const order = await MerchandiseOrder.findOne({
        where: {
          [Op.or]: [
            { id: id },
            { orderNo: id }
          ]
        }
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({
        success: true,
        data: {
          orderNo: order.orderNo,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          productName: order.productName,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          totalAmount: order.totalAmount,
          paymentId: order.paymentId || order.id,
          paymentMethod: order.paymentMethod,
          deliveryMethod: order.deliveryMethod,
          status: order.status,
          createdAt: order.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  },
  // POST /api/orders  (public — called from frontend after payment)
  async create(req, res, next) {
    try {
      const order = await ordersService.create(req.validated);
      res.status(201).json({
        success: true,
        data:    order,
        message: 'Order placed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders  (admin only)
  async getAll(req, res, next) {
    try {
      const { status, deliveryMethod, dateFilter, customDate, search, page, limit } = req.query;
      const result = await ordersService.getAll({ status, deliveryMethod, dateFilter, customDate, search, page, limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/stats  (admin only)
  async getStats(req, res, next) {
    try {
      const stats = await ordersService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/:id  (admin only)
  async getById(req, res, next) {
    try {
      const order = await ordersService.getById(req.params.id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/orders/:id/status  (admin only)
  async updateStatus(req, res, next) {
    try {
      const { status, notes, items, otp } = req.validated;
      const adminId = req.admin?.adminId;
      const updated = await ordersService.updateStatus(req.params.id, status, notes, adminId, items, otp);
      res.json({
        success: true,
        data:    updated,
        message: 'Order status updated',
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/:id/send-otp  (admin only)
  async sendOTP(req, res, next) {
    try {
      const result = await ordersService.sendOTP(req.params.id);
      res.json({
        success: true,
        message: 'OTP verification code sent successfully (Simulated)',
        otp: result.otp,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/:id/verify-payment  (admin only)
  async verifyPayment(req, res, next) {
    try {
      const result = await ordersService.verifyPayment(req.params.id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/ccavenue-initiate  (public — called from frontend to start payment)
  async ccavenueInitiate(req, res, next) {
    try {
      // Force paymentMethod to be 'ccavenue'
      const orderData = {
        ...req.validated,
        paymentMethod: 'ccavenue',
      };
      
      const order = await ordersService.create(orderData);
      
      const { merchantId, accessCode, workingKey, gatewayUrl, redirectUrl, env: ccEnv } = getCCAvenueConfig();
      console.log(`[CCAvenue] Mode: ${ccEnv} | Gateway: ${gatewayUrl}`);

      // Prepare request query string for encryption
      const params = new URLSearchParams();
      params.append('merchant_id', merchantId);
      params.append('order_id', order.orderNo);
      params.append('amount', Number(order.totalAmount).toFixed(2));
      params.append('currency', 'INR');
      params.append('redirect_url', redirectUrl);
      params.append('cancel_url', redirectUrl);
      params.append('billing_name', order.customerName);
      params.append('billing_tel', order.customerPhone);
      params.append('billing_email', order.customerEmail);
      if (order.address) {
        params.append('billing_address', order.address);
      }
      if (order.pincode) {
        params.append('billing_zip', order.pincode);
      }
      params.append('merchant_param1', order.id);
      params.append('merchant_param2', order.size);
      params.append('merchant_param3', order.quantity.toString());

      const encRequest = encrypt(params.toString(), workingKey);
      
      res.json({
        success: true,
        encRequest,
        accessCode,
        actionUrl: gatewayUrl,
        requestParams: params.toString()
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/ccavenue-response  (public — callback from CCAvenue)
  async ccavenueResponse(req, res, next) {
    try {
      const { encResp } = req.body;
      if (!encResp) {
        return res.status(400).send('Error: encResp parameter is missing');
      }

      const { workingKey } = getCCAvenueConfig();
      const decrypted = decrypt(encResp, workingKey);
      
      const params = new URLSearchParams(decrypted);
      const orderNo = params.get('order_id');
      const orderStatus = params.get('order_status'); // Success, Failure, Aborted
      const trackingId = params.get('tracking_id') || '';
      const bankRefNo = params.get('bank_ref_no') || '';
      const paymentMode = params.get('payment_mode') || '';
      const cardName = params.get('card_name') || '';
      const orderId = params.get('merchant_param1');
      const failureMessage = params.get('failure_message') || 'Payment was unsuccessful';

      const order = await MerchandiseOrder.findByPk(orderId);
      if (!order) {
        return res.status(404).send(`Error: Order not found for ID: ${orderId}`);
      }

      const product = await MerchandiseProduct.findByPk(order.productId);
      
      // Helper function to generate slug matching frontend
      const getProductSlug = (prod) => {
        if (!prod) return "";
        let name = '';
        if (prod.name) {
          if (typeof prod.name === 'string') {
            name = prod.name;
          } else if (prod.name.en) {
            name = prod.name.en;
          }
        }
        if (name) {
          return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        }
        return prod.id;
      };

      const productSlug = getProductSlug(product) || order.productId;
      const frontendUrl = process.env.FRONTEND_URL || 'https://mumbaicharaja.co';

      let redirectUrl = '';

      if (orderStatus === 'Success') {
        // Update order status to confirmed
        await order.update({
          status: 'confirmed',
          paymentId: trackingId,
          notes: `CCAvenue tracking_id: ${trackingId}, bank_ref_no: ${bankRefNo}, payment_mode: ${paymentMode}`
        });

        // Auto-create shipment if home delivery and address present
        if (order.deliveryMethod !== 'pickup' && order.address) {
          try {
            const shipment = await shippingService.createShipment({
              orderId: order.id,
              orderNo: order.orderNo,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              address: order.address,
              productName: order.productName,
              quantity: order.quantity,
              size: order.size,
              weight: order.quantity * 0.2
            });

            await order.update({
              shipping: {
                ...shipment,
                pincode: order.pincode,
                deliveryCharge: 0,
                estimatedDeliveryText: ''
              }
            });
          } catch (err) {
            console.error('Failed to auto-create shipment:', err);
          }
        }

        redirectUrl = `${frontendUrl}/merchandise/${productSlug}/checkout?status=success&orderNo=${order.orderNo}&amount=${order.totalAmount}&txnId=${trackingId}&bankRefNo=${encodeURIComponent(bankRefNo)}&paymentMode=${encodeURIComponent(paymentMode)}&cardName=${encodeURIComponent(cardName)}&orderStatus=${orderStatus}&deliveryMethod=${order.deliveryMethod}&customerName=${encodeURIComponent(order.customerName)}&customerPhone=${order.customerPhone}&customerEmail=${order.customerEmail}&size=${encodeURIComponent(order.size)}&quantity=${order.quantity}&otpCode=${order.otpCode || ''}`;
      } else {
        // Update status to cancelled
        await order.update({
          status: 'cancelled',
          notes: `CCAvenue payment status: ${orderStatus}. Details: ${failureMessage}`
        });

        redirectUrl = `${frontendUrl}/merchandise/${productSlug}/checkout?status=failure&orderNo=${order.orderNo}&message=${encodeURIComponent(failureMessage)}`;
      }

      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/ccavenue-simulator  (public — mock gateway for developers)
  async ccavenueSimulator(req, res, next) {
    try {
      const { encRequest, access_code } = req.body;
      if (!encRequest) {
        return res.status(400).send('Error: encRequest is missing');
      }

      const { workingKey } = getCCAvenueConfig();
      const decrypted = decrypt(encRequest, workingKey);
      const params = new URLSearchParams(decrypted);

      const orderNo = params.get('order_id');
      const amount = params.get('amount');
      const customerName = params.get('billing_name') || 'Devotee';
      const orderId = params.get('merchant_param1');
      const redirectUrl = params.get('redirect_url');

      // Success Encrypted Response
      const successParams = new URLSearchParams();
      successParams.append('order_id', orderNo);
      successParams.append('tracking_id', 'TXN' + Date.now());
      successParams.append('bank_ref_no', 'BANK' + Math.floor(Math.random() * 1000000));
      successParams.append('order_status', 'Success');
      successParams.append('payment_mode', 'UPI');
      successParams.append('amount', amount);
      successParams.append('merchant_param1', orderId);
      const encSuccess = encrypt(successParams.toString(), workingKey);

      // Failure Encrypted Response
      const failureParams = new URLSearchParams();
      failureParams.append('order_id', orderNo);
      failureParams.append('tracking_id', 'TXN' + Date.now());
      failureParams.append('order_status', 'Failure');
      failureParams.append('failure_message', 'User cancelled the transaction');
      failureParams.append('merchant_param1', orderId);
      const encFailure = encrypt(failureParams.toString(), workingKey);

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CCAvenue Merchant Sandbox</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Outfit', sans-serif;
              background: radial-gradient(circle at 50% 50%, #1e1b4b, #0f0b29);
              color: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .card {
              background: rgba(30, 41, 59, 0.45);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 28px;
              width: 100%;
              max-width: 460px;
              padding: 40px;
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b);
            }
            .logo-placeholder {
              font-size: 40px;
              margin-bottom: 10px;
            }
            h1 {
              font-size: 24px;
              font-weight: 800;
              margin: 10px 0 5px 0;
              color: #fff;
              letter-spacing: -0.02em;
            }
            .subtitle {
              font-size: 13px;
              color: #94a3b8;
              margin-bottom: 30px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
            }
            .info-box {
              background: rgba(15, 23, 42, 0.4);
              border-radius: 20px;
              padding: 20px;
              margin-bottom: 35px;
              text-align: left;
              border: 1px solid rgba(255, 255, 255, 0.04);
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              font-size: 14px;
            }
            .info-row:last-child {
              margin-bottom: 0;
              padding-top: 12px;
              border-top: 1px dashed rgba(255, 255, 255, 0.1);
            }
            .label {
              color: #94a3b8;
              font-weight: 500;
            }
            .value {
              color: #f1f5f9;
              font-weight: 600;
            }
            .value.amount {
              color: #f59e0b;
              font-size: 18px;
              font-weight: 800;
            }
            .btn-group {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .btn {
              padding: 16px 24px;
              border: none;
              border-radius: 16px;
              font-size: 15px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s ease-in-out;
              width: 100%;
            }
            .btn-success {
              background: #10b981;
              color: #fff;
              box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
            }
            .btn-success:hover {
              background: #059669;
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            }
            .btn-danger {
              background: #ef4444;
              color: #fff;
              box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
              margin-top: 10px;
            }
            .btn-danger:hover {
              background: #dc2626;
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
            }
            .footer-note {
              margin-top: 25px;
              font-size: 11px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo-placeholder">💳</div>
            <h1>CCAvenue Merchant</h1>
            <div class="subtitle">Developer Sandbox</div>
            
            <div class="info-box">
              <div class="info-row">
                <span class="label">Devotee Name</span>
                <span class="value">${customerName}</span>
              </div>
              <div class="info-row">
                <span class="label">Order Number</span>
                <span class="value">${orderNo}</span>
              </div>
              <div class="info-row" style="border-top: 1px dashed rgba(255,255,255,0.08); margin-top: 12px; padding-top: 12px;">
                <span class="label" style="align-self: center;">Total Amount</span>
                <span class="value amount">₹${amount}</span>
              </div>
            </div>

            <div class="btn-group">
              <form method="POST" action="${redirectUrl}">
                <input type="hidden" name="encResp" value="${encSuccess}">
                <button type="submit" class="btn btn-success">✓ Simulate Successful Payment</button>
              </form>
              
              <form method="POST" action="${redirectUrl}">
                <input type="hidden" name="encResp" value="${encFailure}">
                <button type="submit" class="btn btn-danger">✗ Simulate Failed Payment</button>
              </form>
            </div>

            <div class="footer-note">
              This is a secure local simulation of the CCAvenue checkout flow. No real money will be charged.
            </div>
          </div>
          <script>
            document.addEventListener("DOMContentLoaded", () => {
              const forms = document.querySelectorAll("form");
              forms.forEach(form => {
                try {
                  const actionUrl = new URL(form.action);
                  actionUrl.protocol = window.location.protocol;
                  actionUrl.host = window.location.host;
                  form.action = actionUrl.toString();
                } catch (e) {
                  console.error("Failed to parse form action URL:", e);
                }
              });
            });
          </script>
        </body>
        </html>
      `;
      res.send(html);
    } catch (error) {
      next(error);
    }
  },
};

