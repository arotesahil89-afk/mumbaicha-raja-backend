import { donationsService } from '../services/donationsService.js';

export const donationsController = {
  // POST /api/donations/send-otp (public)
  async sendOTP(req, res, next) {
    try {
      const result = await donationsService.sendOTP(req.validated);
      res.json({
        success: true,
        data: result,
        message: result.message || 'OTP sent successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/donations/verify-otp (public)
  async verifyOTP(req, res, next) {
    try {
      const result = await donationsService.verifyOTP(req.validated);
      res.json({
        success: true,
        data: result,
        message: 'Phone number verified successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/donations/initiate (public)
  async initiate(req, res, next) {
    try {
      const result = await donationsService.initiateDonation(req.validated);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Donation initiated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/donations/ccavenue-response (public callback from gateway)
  async ccavenueResponse(req, res, next) {
    try {
      const encResp = req.body?.encResp || req.query?.encResp || '';
      const result = await donationsService.handleCCAvenueResponse(encResp);
      
      // Redirect browser directly to frontend success or failure page
      return res.redirect(result.redirectUrl);
    } catch (error) {
      console.error('[CCAvenue Response Callback Error]:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/donate-now?status=failure&message=${encodeURIComponent('Payment processing error')}`);
    }
  },

  // GET /api/donations/pavati/:id (public)
  async getPavati(req, res, next) {
    try {
      const donation = await donationsService.getById(req.params.id);
      res.json({
        success: true,
        data: donation,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/donations (admin only)
  async getAll(req, res, next) {
    try {
      const { status, paymentMethod, search, page, limit, startDate, endDate } = req.query;
      const result = await donationsService.getAll({
        status,
        paymentMethod,
        search,
        page,
        limit,
        startDate,
        endDate,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/donations/stats (admin only)
  async getStats(req, res, next) {
    try {
      const stats = await donationsService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/donations/:id (admin only)
  async getById(req, res, next) {
    try {
      const donation = await donationsService.getById(req.params.id);
      res.json({ success: true, data: donation });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/donations/:id/resend-sms (admin only)
  async resendSMS(req, res, next) {
    try {
      const result = await donationsService.resendSMS(req.params.id);
      res.json({
        success: true,
        data: result,
        message: 'Receipt SMS resent successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
