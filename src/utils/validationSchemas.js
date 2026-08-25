import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

export const createAwardSchema = Joi.object({
  language: Joi.string().valid('en', 'hi', 'mr').required().messages({
    'any.only': 'Language must be en, hi, or mr',
    'any.required': 'Language is required',
  }),
  text: Joi.string().required().messages({
    'any.required': 'Award text is required',
  }),
  heading: Joi.string().required().messages({
    'any.required': 'Heading is required',
  }),
  displayOrder: Joi.number().optional(),
});

export const updateAwardSchema = Joi.object({
  language: Joi.string().valid('en', 'hi', 'mr').optional(),
  text: Joi.string().optional(),
  heading: Joi.string().optional(),
  displayOrder: Joi.number().optional(),
});

export const createEventSchema = Joi.object({
  title: Joi.object({
    en: Joi.string().required(),
    hi: Joi.string().required(),
    mr: Joi.string().required(),
  }).required(),

  description: Joi.object({
    en: Joi.string().required(),
    hi: Joi.string().required(),
    mr: Joi.string().required(),
  }).required(),

  date: Joi.string().required(),

  eventTime: Joi.forbidden(),

  time: Joi.string()
    .pattern(/^\d{1,2}:\d{2}\s(AM|PM)$/)
    .required()
    .messages({
      "string.pattern.base": "Time must be in format HH:MM AM/PM",
    }),
});

export const updateEventSchema = Joi.object({
  title: Joi.object({
    en: Joi.string(),
    hi: Joi.string(),
    mr: Joi.string(),
  }).optional(),

  description: Joi.object({
    en: Joi.string(),
    hi: Joi.string(),
    mr: Joi.string(),
  }).optional(),

  date: Joi.string().optional(),

  time: Joi.string()
    .pattern(/^\d{1,2}:\d{2}\s(AM|PM)$/)
    .optional(),
});

export const createOrderSchema = Joi.object({
  customerName:  Joi.string().min(2).required().messages({
    'string.min':   'Customer name must be at least 2 characters',
    'any.required': 'Customer name is required',
  }),
  customerEmail: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Customer email is required',
  }),
  customerPhone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number',
    'any.required':        'Customer phone is required',
  }),
  productName:   Joi.string().required(),
  productId:     Joi.string().optional().allow(null, ''),
  size:          Joi.string().required(),
  quantity:      Joi.number().integer().min(1).max(50).required(),
  unitPrice:     Joi.number().positive().required(),
  totalAmount:   Joi.number().positive().required(),
  paymentMethod: Joi.string().valid('online', 'pickup', 'card', 'upi', 'cod').required(),
  paymentId:     Joi.string().optional().allow(null, ''),
  address:       Joi.string().optional().allow(null, ''),
  pincode:       Joi.string().optional().allow(null, ''),
  shippingCharge:Joi.number().optional().allow(null, 0),
  deliveryMethod:Joi.string().valid('pickup', 'home').optional(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'picked_up', 'partially_picked_up')
    .required()
    .messages({
      'any.only':     'Status must be one of: pending, confirmed, cancelled, picked_up, partially_picked_up',
      'any.required': 'Status is required',
    }),
  notes: Joi.string().optional().allow('', null),
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      size: Joi.string().required(),
      status: Joi.string().valid('pending', 'picked_up').required(),
    })
  ).optional(),
  otp: Joi.string().length(6).optional().allow('', null),
});

export const sendDonationOtpSchema = Joi.object({
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number',
    'any.required': 'Phone number is required',
  }),
});

export const verifyDonationOtpSchema = Joi.object({
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number',
    'any.required': 'Phone number is required',
  }),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be exactly 6 digits',
    'any.required': 'OTP is required',
  }),
  otpSessionToken: Joi.string().optional().allow('', null),
});

export const initiateDonationSchema = Joi.object({
  donorName: Joi.string().min(2).required().messages({
    'string.min': 'Donor name must be at least 2 characters',
    'any.required': 'Donor name is required',
  }),
  donorPhone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number',
    'any.required': 'Donor phone is required',
  }),
  donorAddress: Joi.string().min(5).required().messages({
    'string.min': 'Please enter a valid address (min 5 characters)',
    'any.required': 'Address is required',
  }),
  amount: Joi.number().positive().min(1).required().messages({
    'number.min': 'Donation amount must be at least ₹1',
    'any.required': 'Donation amount is required',
  }),
  disclaimerAccepted: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must accept the terms and disclaimer to proceed',
    'any.required': 'Disclaimer must be accepted',
  }),
  cause: Joi.string().optional().allow('', null),
  donorEmail: Joi.string().email().optional().allow('', null),
  panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).optional().allow('', null).messages({
    'string.pattern.base': 'Please provide a valid 10-character PAN number',
  }),
  verificationToken: Joi.string().optional().allow('', null),
  notes: Joi.string().optional().allow('', null),
});

export const updateDonationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'failed', 'refunded').required(),
  notes: Joi.string().optional().allow('', null),
});

