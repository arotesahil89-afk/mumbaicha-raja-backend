import { shippingService } from '../services/shipping/shippingService.js';
import { mockProvider } from '../services/shipping/providers/mockProvider.js';
import MerchandiseOrder from '../models/MerchandiseOrder.js';
import PincodeMaster from '../models/PincodeMaster.js';
import path from 'path';
import fs from 'fs';

export const shippingController = {
  // POST /api/shipping/create
  async create(req, res, next) {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, error: 'orderId is required' });
      }

      const order = await MerchandiseOrder.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      if (!order.address) {
        return res.status(400).json({ success: false, error: 'Order does not have a delivery address' });
      }

      // If already has shipping details
      if (order.shipping && order.shipping.awb) {
        return res.json({ success: true, data: order.shipping, message: 'Shipment already exists' });
      }

      // Read or recalculate delivery details
      // Get pincode from shipping block if stored, or parse from address
      let pincode = '';
      if (order.shipping && order.shipping.pincode) {
        pincode = order.shipping.pincode;
      } else {
        const pinMatch = order.address.match(/\b\d{6}\b/);
        pincode = pinMatch ? pinMatch[0] : '';
      }

      let deliveryCharge = 0;
      let city = 'Mumbai';
      let state = 'Maharashtra';
      let estDeliveryStr = '3-4 Days';

      if (pincode) {
        const pinRecord = await PincodeMaster.findByPk(pincode);
        if (pinRecord) {
          deliveryCharge = pinRecord.deliveryCharge;
          city = pinRecord.city;
          state = pinRecord.state;
          estDeliveryStr = pinRecord.estimatedDelivery;
        }
      }

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

      // Merge pincode data
      const mergedShipment = {
        ...shipment,
        pincode,
        city,
        state,
        deliveryCharge,
        estimatedDeliveryText: estDeliveryStr,
        ...((order.shipping) ? order.shipping : {})
      };

      // Keep generated awb details
      mergedShipment.awb = shipment.awb;
      mergedShipment.shipmentId = shipment.shipmentId;
      mergedShipment.status = shipment.status;
      mergedShipment.labelUrl = shipment.labelUrl;
      mergedShipment.manifestUrl = shipment.manifestUrl;

      await order.update({
        shipping: mergedShipment
      }, {
        where: { id: orderId }
      });

      res.status(201).json({
        success: true,
        data: mergedShipment,
        message: 'Shipment created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/shipping/track/:awb
  async track(req, res, next) {
    try {
      const { awb } = req.params;
      const shippingDetails = await shippingService.refreshStatus(awb);
      res.json({
        success: true,
        data: shippingDetails
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/shipping/cancel
  async cancel(req, res, next) {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, error: 'orderId is required' });
      }

      const shippingDetails = await shippingService.cancelShipment(orderId);
      res.json({
        success: true,
        data: shippingDetails,
        message: 'Shipment cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/shipping/label/:awb
  async label(req, res, next) {
    try {
      const { awb } = req.params;
      const filePath = path.resolve('shipping_docs', `label_${awb}.pdf`);
      
      // Self-healing: if file does not exist, look up order and re-generate on the fly
      if (!fs.existsSync(filePath)) {
        const orders = await MerchandiseOrder.findAll();
        const order = orders.find(o => o.shipping && o.shipping.awb === awb);
        
        if (order) {
          const docsDir = path.resolve('shipping_docs');
          if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
          }

          const city = order.shipping.destination || order.shipping.city || 'Mumbai';
          const weight = order.shipping.weight || (order.quantity * 0.2);
          
          const payload = {
            orderNo: order.orderNo,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            address: order.address,
            productName: order.productName,
            quantity: order.quantity,
            size: order.size
          };

          await mockProvider.generateLabelPDF(
            filePath,
            awb,
            order.shipping.shipmentId || 'SHP_TEMP',
            payload,
            city,
            weight
          );
        } else {
          return res.status(404).json({ success: false, error: 'Label PDF not found' });
        }
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="label_${awb}.pdf"`);
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/shipping/manifest/:id
  async manifest(req, res, next) {
    try {
      const { id } = req.params; // shipmentId
      const filePath = path.resolve('shipping_docs', `manifest_${id}.pdf`);
      
      // Self-healing: if file does not exist, look up order and re-generate on the fly
      if (!fs.existsSync(filePath)) {
        const orders = await MerchandiseOrder.findAll();
        const order = orders.find(o => o.shipping && o.shipping.shipmentId === id);

        if (order) {
          const docsDir = path.resolve('shipping_docs');
          if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
          }

          const city = order.shipping.destination || order.shipping.city || 'Mumbai';
          const weight = order.shipping.weight || (order.quantity * 0.2);
          const manifestId = order.shipping.manifestId || 'MNF_' + Math.floor(10000000 + Math.random() * 90000000).toString();

          const payload = {
            orderNo: order.orderNo,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            address: order.address,
            productName: order.productName,
            quantity: order.quantity,
            size: order.size
          };

          await mockProvider.generateManifestPDF(
            filePath,
            manifestId,
            order.shipping.awb,
            payload,
            city,
            weight
          );
        } else {
          return res.status(404).json({ success: false, error: 'Manifest PDF not found' });
        }
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="manifest_${id}.pdf"`);
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/shipping/status/:awb
  async status(req, res, next) {
    try {
      const { awb } = req.params;
      const shippingDetails = await shippingService.refreshStatus(awb);
      res.json({
        success: true,
        data: {
          awb: shippingDetails.awb,
          status: shippingDetails.status,
          estimatedDelivery: shippingDetails.estimatedDelivery
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // ─── Pincode Master Checker (Public) ─────────────────────────────────────
  // GET /api/shipping/pincode/:pincode
  async checkPincode(req, res, next) {
    try {
      const { pincode } = req.params;
      if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
        return res.json({
          deliveryAvailable: false,
          city: '',
          state: '',
          deliveryCharge: 0,
          estimatedDelivery: ''
        });
      }

      const record = await PincodeMaster.findOne({
        where: { pincode, active: true }
      });

      if (!record) {
        return res.json({
          deliveryAvailable: false,
          city: '',
          state: '',
          deliveryCharge: 0,
          estimatedDelivery: ''
        });
      }

      res.json({
        deliveryAvailable: true,
        city: record.city,
        state: record.state,
        deliveryCharge: record.deliveryCharge,
        estimatedDelivery: record.estimatedDelivery
      });
    } catch (error) {
      next(error);
    }
  },

  // ─── Pincode Master CRUD (Admin only) ────────────────────────────────────
  // GET /api/shipping/pincodes
  async listPincodes(req, res, next) {
    try {
      const list = await PincodeMaster.findAll({
        order: [['pincode', 'ASC']]
      });
      res.json({
        success: true,
        data: list
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/shipping/pincodes
  async createPincode(req, res, next) {
    try {
      const { pincode, city, state, deliveryCharge, estimatedDelivery, active } = req.body;
      if (!pincode || !city || !state || deliveryCharge == null) {
        return res.status(400).json({ success: false, error: 'Pincode, city, state, and delivery charge are required' });
      }

      const existing = await PincodeMaster.findByPk(pincode);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Pincode already exists in master' });
      }

      const newRecord = await PincodeMaster.create({
        pincode,
        city,
        state,
        deliveryCharge: Number(deliveryCharge),
        estimatedDelivery: estimatedDelivery || '3-4 Days',
        active: active !== false
      });

      res.status(201).json({
        success: true,
        data: newRecord,
        message: 'Pincode added successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/shipping/pincodes/:pincode
  async updatePincode(req, res, next) {
    try {
      const { pincode } = req.params;
      const { city, state, deliveryCharge, estimatedDelivery, active } = req.body;

      const record = await PincodeMaster.findByPk(pincode);
      if (!record) {
        return res.status(404).json({ success: false, error: 'Pincode not found' });
      }

      await record.update({
        city: city !== undefined ? city : record.city,
        state: state !== undefined ? state : record.state,
        deliveryCharge: deliveryCharge !== undefined ? Number(deliveryCharge) : record.deliveryCharge,
        estimatedDelivery: estimatedDelivery !== undefined ? estimatedDelivery : record.estimatedDelivery,
        active: active !== undefined ? active : record.active
      });

      res.json({
        success: true,
        data: record,
        message: 'Pincode updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/shipping/pincodes/:pincode
  async deletePincode(req, res, next) {
    try {
      const { pincode } = req.params;
      const record = await PincodeMaster.findByPk(pincode);
      if (!record) {
        return res.status(404).json({ success: false, error: 'Pincode not found' });
      }

      await record.destroy();
      res.json({
        success: true,
        message: 'Pincode deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
