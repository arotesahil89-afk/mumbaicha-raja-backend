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
  titleEn: Joi.string().required(),
  titleHi: Joi.string().required(),
  titleMr: Joi.string().required(),
  descriptionEn: Joi.string().required(),
  descriptionHi: Joi.string().required(),
  descriptionMr: Joi.string().required(),
  eventDate: Joi.date().iso().required(),
  eventTime: Joi.string().pattern(/^\d{1,2}:\d{2}\s(AM|PM)$/).required().messages({
    'string.pattern.base': 'Time must be in format HH:MM AM/PM',
  }),
});

export const updateEventSchema = Joi.object({
  titleEn: Joi.string().optional(),
  titleHi: Joi.string().optional(),
  titleMr: Joi.string().optional(),
  descriptionEn: Joi.string().optional(),
  descriptionHi: Joi.string().optional(),
  descriptionMr: Joi.string().optional(),
  eventDate: Joi.date().iso().optional(),
  eventTime: Joi.string().pattern(/^\d{1,2}:\d{2}\s(AM|PM)$/).optional(),
});
