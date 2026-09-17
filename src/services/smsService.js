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
   * Send Donation Confirmation SMS
   * Sender ID: LSUMGG
   * DLT Template ID: 1177178955987738284
   * MSG91 Flow ID: 6aab8d5bb7eb4c0f640ab5f4
   * Text: Thank you ##var1##! Rs. ##var2## donated to Mumbai Cha Raja confirmed. Ref: ##var3##. Receipt: ##var4##. Ganpati Bappa Morya! -Mumbai Cha Raja
   */
  async sendDonationReceiptSMS({ donorName, donorPhone, amount, donationNo, receiptUrl }) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const flowId = process.env.MSG91_DONATION_FLOW_ID || '6aab8d5bb7eb4c0f640ab5f4';
    const senderId = process.env.MSG91_SENDER_ID || 'LSUMGG';

    let cleanedPhone = String(donorPhone).replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
      cleanedPhone = `91${cleanedPhone}`;
    }

    // DLT approved CTA Short Domain URL format: https://mumbaicharaja.co/LSUMGG/DON-XXXXXXXX-XXX
    const shortCtaDomain = process.env.SMS_SHORT_CTA_DOMAIN || 'https://mumbaicharaja.co/LSUMGG/';
    const cleanDomain = shortCtaDomain.endsWith('/') ? shortCtaDomain : `${shortCtaDomain}/`;
    const downloadLink = `${cleanDomain}${donationNo}`;

    // Ensure amount is strictly formatted as an integer (e.g. 2001 or 1, not float like 1.00)
    const formattedAmount = String(Math.round(Number(amount) || 0));
    const formattedDonorName = donorName || 'Devotee';

    if (!authKey) {
      console.log('--------------------------------------------------');
      console.log(`[SMS MOCK] Donation Receipt Confirmation`);
      console.log(`[SMS MOCK] To: +${cleanedPhone}`);
      console.log(`[SMS MOCK] Name: ${formattedDonorName}`);
      console.log(`[SMS MOCK] Amount: ₹${formattedAmount}`);
      console.log(`[SMS MOCK] Message: Thank you ${formattedDonorName}! Rs. ${formattedAmount} donated to Mumbai Cha Raja confirmed. Ref: ${donationNo}. Receipt: ${downloadLink}. Ganpati Bappa Morya! -Mumbai Cha Raja`);
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
          sender: senderId,
          short_url: process.env.MSG91_SHORT_URL || '0',
          recipients: [
            {
              mobiles: cleanedPhone,
              // Required flow template variables for DLT Template 1177178955987738284:
              // VAR 1 - NAME
              // VAR 2 - AMOUNT (strictly integer)
              // VAR 3 - RECEIPT NO
              // VAR 4 - PDF URL (strictly https://mumbaicharaja.co/LSUMGG/DON-XXXXXXXX-XXX)
              var1: formattedDonorName,
              var2: formattedAmount,
              var3: String(donationNo),
              var4: downloadLink,
              // Secondary fallback keys:
              name: formattedDonorName,
              amount: formattedAmount,
              donation_no: String(donationNo),
              receipt_no: String(donationNo),
              link: downloadLink,
              receipt_url: downloadLink,
              orderno: String(donationNo),
              txnid: String(donationNo),
            },
          ],
        }),
      });

      const data = await response.json().catch(() => ({}));
      console.log('[MSG91 Donation Confirmation Flow Response]:', data);
      return { success: true, data };
    } catch (err) {
      console.error('[MSG91 Donation Confirmation Flow Error]:', err);
      return { success: false, error: err.message };
    }
  },
};
