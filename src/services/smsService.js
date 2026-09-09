/**
 * smsService.js
 * MSG91 SMS & OTP Service with dev simulation fallback.
 */

export const smsService = {
  /**
   * Send Phone Verification OTP
   */
  async sendOTP({ phone, otp }) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID || process.env.MSG91_OTP_FLOW_ID || '6a72f6a97d575680c2062492';
    const senderId = process.env.MSG91_SENDER_ID || 'LSUMGG';

    // Clean phone number (add 91 country code if 10 digits)
    let cleanedPhone = String(phone).replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
      cleanedPhone = `91${cleanedPhone}`;
    }

    if (!authKey) {
      console.log('--------------------------------------------------');
      console.log(`[SMS MOCK] Devotee Phone OTP Verification`);
      console.log(`[SMS MOCK] To: +${cleanedPhone}`);
      console.log(`[SMS MOCK] Message: Use OTP ${otp} to verify your request. This OTP is valid for 10 minutes. Do not share it with anyone. Mumbai Cha Raja`);
      console.log('--------------------------------------------------');
      return { success: true, simulated: true };
    }

    try {
      // 1. Try MSG91 Flow API (standard for DLT Flow Template IDs like 1177178583727043101)
      const flowPayload = {
        template_id: templateId,
        sender: senderId,
        recipients: [
          {
            mobiles: cleanedPhone,
            var1: otp,
            var: otp,
            OTP: otp,
            otp: otp,
            num: otp,
          },
        ],
      };

      const flowRes = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'authkey': authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowPayload),
      });

      const flowData = await flowRes.json().catch(() => ({}));
      console.log('[MSG91 OTP Flow Response]:', flowData);

      if (flowData && (flowData.type === 'success' || flowData.status === 'success' || flowRes.ok)) {
        return { success: true, data: flowData };
      }

      // 2. Fallback to MSG91 Direct OTP API if Flow API response is not success
      console.log('[MSG91 OTP] Flow API fallback to Direct OTP API...');
      const otpUrl = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanedPhone}&authkey=${authKey}&otp=${otp}`;
      const otpRes = await fetch(otpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ var1: otp, num: otp, OTP: otp, otp: otp }),
      });

      const otpData = await otpRes.json().catch(() => ({}));
      console.log('[MSG91 OTP Direct API Response]:', otpData);
      return { success: true, data: otpData };
    } catch (err) {
      console.error('[MSG91 OTP Error]:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Send Donation Confirmation & Pavati Download Link SMS
   */
  async sendDonationReceiptSMS({ donorName, donorPhone, amount, donationNo, receiptUrl }) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const flowId = process.env.MSG91_DONATION_FLOW_ID || process.env.MSG91_FLOW_ID;
    const senderId = process.env.MSG91_SENDER_ID || 'MRJA';

    let cleanedPhone = String(donorPhone).replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
      cleanedPhone = `91${cleanedPhone}`;
    }

    const downloadLink = receiptUrl || `https://mumbaicharaja.co/pavati/${donationNo}`;

    if (!authKey || !flowId) {
      console.log('--------------------------------------------------');
      console.log(`[SMS MOCK] Donation Receipt Confirmation`);
      console.log(`[SMS MOCK] To: +${cleanedPhone}`);
      console.log(`[SMS MOCK] Name: ${donorName}`);
      console.log(`[SMS MOCK] Amount: ₹${amount}`);
      console.log(`[SMS MOCK] Message: || श्री गजानन प्रसन्न || धन्यवाद ${donorName}, लालबाग सार्वजनिक उत्सव मंडळ, गणेशगल्ली (मुंबईचा राजा) साठी तुमची ₹${amount} ची देणगी यशस्वीरित्या जमा झाली आहे. आपली अधिकृत पावती डाउनलोड करा: ${downloadLink}`);
      console.log('--------------------------------------------------');
      return { success: true, simulated: true };
    }

    try {
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'authkey': authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: flowId,
          short_url: '0',
          recipients: [
            {
              mobiles: cleanedPhone,
              name: donorName,
              amount: String(amount),
              link: downloadLink,
              donation_no: donationNo,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log('[MSG91 Flow Response]:', data);
      return { success: true, data };
    } catch (err) {
      console.error('[MSG91 Flow Error]:', err);
      return { success: false, error: err.message };
    }
  },
};
