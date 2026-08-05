/**
 * Backend MSG91 Service
 * Executes secure server-to-server calls using secret process.env.MSG91_AUTH_KEY.
 * Uses native fetch (Node 18+) so no external dependencies (like axios) are required.
 */
export const msg91Service = {
  // Server-side in-memory deduplication set
  sentOrdersLock: new Set(),

  async sendOrderConfirmationSMS({ orderNo, customerPhone, customerName = 'Devotee', amount = 330, txnId = '' }) {
    if (!orderNo || !customerPhone) {
      return { success: false, message: 'Missing orderNo or customerPhone' };
    }

    // Server-side Deduplication Lock
    if (this.sentOrdersLock.has(orderNo)) {
      console.log(`[Backend MSG91] Order #${orderNo} SMS was already sent. Skipping duplicate trigger.`);
      return { success: true, message: 'SMS already sent for this order.', skipped: true };
    }

    // Mark locked
    this.sentOrdersLock.add(orderNo);

    // Format phone (prepend 91 for 10-digit Indian numbers)
    let cleanedPhone = String(customerPhone).replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
      cleanedPhone = `91${cleanedPhone}`;
    }

    const authKey  = process.env.MSG91_AUTH_KEY;
    const flowId   = process.env.MSG91_FLOW_ID;
    const senderId = process.env.MSG91_SENDER_ID || 'MRJA';

    if (!authKey || !flowId) {
      console.log(
        `[Backend MSG91 Simulation] SMS for Order #${orderNo} to +${cleanedPhone} (₹${amount}). Set MSG91_AUTH_KEY and MSG91_FLOW_ID in backend .env to enable live delivery.`
      );
      return {
        success: true,
        message: 'MSG91 SMS provisioned in simulation mode. Configured keys in backend .env will send live SMS.',
        simulated: true
      };
    }

    try {
      const payload = {
        template_id: flowId,
        sender: senderId,
        short_url: '1',
        recipients: [
          {
            mobiles: cleanedPhone,
            name: customerName,
            orderno: orderNo,
            amount: String(amount),
            txnid: txnId || orderNo
          }
        ]
      };

      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          authkey: authKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      console.log(`[Backend MSG91 Success] Order #${orderNo} SMS sent to +${cleanedPhone}`, data);
      return { success: true, data };
    } catch (err) {
      console.error('[Backend MSG91 Error]', err?.message || err);
      // Release lock on API failure to allow retry if needed
      this.sentOrdersLock.delete(orderNo);
      return { success: false, message: err?.message || 'Failed to call MSG91 API' };
    }
  }
};
