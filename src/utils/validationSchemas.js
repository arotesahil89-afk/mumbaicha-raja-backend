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
