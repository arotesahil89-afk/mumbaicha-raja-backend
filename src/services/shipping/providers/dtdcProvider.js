/**
 * Real DTDC Shipping Provider
 * 
 * Replace this stub implementation with actual integration with the DTDC Courier API
 * when you receive API credentials.
 * 
 * The interface must match the exact same structure as the Mock Provider (duck typing)
 * so that shifting from mock to real DTDC only requires changing the provider.
 */

export const dtdcProvider = {
  name: 'dtdc',
  
  // ─── Create Shipment (Real DTDC API call) ───────────────────────────────
  async createShipment(data) {
    console.log('Real DTDC createShipment called with data:', data);
    
    // Example Integration Pattern:
    // const response = await axios.post('https://api.dtdc.com/v1/shipments', {
    //   sender: { name: "Mumbai Cha Raja", pin: "400012", ... },
    //   receiver: { name: data.customerName, phone: data.customerPhone, address: data.address, ... },
    //   shipment: { weight: data.weight, product: data.productName, qty: data.quantity, ... }
    // }, {
    //   headers: { 'Authorization': 'Bearer ' + process.env.DTDC_API_KEY }
    // });
    //
    // const result = response.data;
    
    // For now, return a placeholder that mimics the format
    throw new Error('Real DTDC API integration is not implemented. Please use SHIPPING_PROVIDER=mock in your .env file.');
  },
  
  // ─── Track Shipment (Real DTDC API tracking query) ──────────────────────
  async trackShipment(awb, createdAt, address, manualStatus = null) {
    console.log('Real DTDC trackShipment called for AWB:', awb);
    
    // Example:
    // const response = await axios.get(`https://api.dtdc.com/v1/tracking/${awb}`);
    // return formatDtdcTrackingResponse(response.data);
    
    throw new Error('Real DTDC API tracking is not implemented.');
  },
  
  // ─── Cancel Shipment ────────────────────────────────────────────────────
  async cancelShipment(awb) {
    console.log('Real DTDC cancelShipment called for AWB:', awb);
    
    // Example:
    // const response = await axios.post(`https://api.dtdc.com/v1/shipments/${awb}/cancel`);
    // return response.data;
    
    throw new Error('Real DTDC API cancellation is not implemented.');
  }
};
