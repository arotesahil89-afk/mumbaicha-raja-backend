import { mockProvider } from './providers/mockProvider.js';
import { dtdcProvider } from './providers/dtdcProvider.js';
import MerchandiseOrder from '../../models/MerchandiseOrder.js';

class ShippingService {
  constructor() {
    this.providers = {
      mock: mockProvider,
      dtdc: dtdcProvider
    };
  }

  // Resolve provider based on env variable
  getProvider() {
    const providerName = process.env.SHIPPING_PROVIDER || 'mock';
    const provider = this.providers[providerName.toLowerCase()];
    if (!provider) {
      throw new Error(`Unsupported shipping provider: ${providerName}`);
    }
    return provider;
  }

  // ─── Create Shipment ─────────────────────────────────────────────────────
  async createShipment(data) {
    const provider = this.getProvider();
    return await provider.createShipment(data);
  }

  // ─── Track Shipment ──────────────────────────────────────────────────────
  async trackShipment(awb, createdAt, address, manualStatus = null) {
    const provider = this.getProvider();
    return provider.trackShipment(awb, createdAt, address, manualStatus);
  }

  // ─── Cancel Shipment ─────────────────────────────────────────────────────
  async cancelShipment(orderId) {
    const order = await MerchandiseOrder.findByPk(orderId);
    if (!order || !order.shipping) {
      throw new Error('Order or shipping details not found');
    }

    const provider = this.getProvider();
    const result = await provider.cancelShipment(order.shipping.awb);

    if (result.success) {
      const updatedShipping = {
        ...order.shipping,
        status: 'Cancelled',
        manualStatus: 'Cancelled',
        updatedAt: new Date().toISOString()
      };

      // Also update timeline with Cancelled event
      const tracking = provider.trackShipment(
        order.shipping.awb,
        order.shipping.createdAt,
        order.address,
        'Cancelled'
      );
      updatedShipping.timeline = tracking.timeline;

      await MerchandiseOrder.update({
        shipping: updatedShipping
      }, {
        where: { id: orderId }
      });

      return updatedShipping;
    }

    throw new Error('Failed to cancel shipment');
  }

  // ─── Refresh Shipment Status ─────────────────────────────────────────────
  async refreshStatus(awb) {
    const order = await MerchandiseOrder.findOne({
      where: {
        'shipping.awb': awb
      }
    });

    if (!order || !order.shipping) {
      throw new Error(`Shipment with AWB ${awb} not found`);
    }

    const provider = this.getProvider();
    
    // Calculate current dynamic timeline and status
    const tracking = provider.trackShipment(
      awb,
      order.shipping.createdAt,
      order.address,
      order.shipping.manualStatus || null
    );

    // If status or timeline length changed, save to DB
    if (order.shipping.status !== tracking.status || 
        !order.shipping.timeline || 
        order.shipping.timeline.length !== tracking.timeline.length) {
      
      const updatedShipping = {
        ...order.shipping,
        status: tracking.status,
        timeline: tracking.timeline,
        updatedAt: new Date().toISOString()
      };

      await MerchandiseOrder.update({
        shipping: updatedShipping
      }, {
        where: { id: order.id }
      });

      return updatedShipping;
    }

    return order.shipping;
  }
}

export const shippingService = new ShippingService();
