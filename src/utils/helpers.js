import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const groupAwardsByLanguage = (awards) => {
  const grouped = {
    heading: {
      en: '',
      hi: '',
      mr: '',
    },
    en: [],
    hi: [],
    mr: [],
  };

  awards.forEach((award) => {
    if (!grouped[award.language]) {
      grouped[award.language] = [];
    }
    grouped[award.language].push(award.text);
    if (!grouped.heading[award.language]) {
      grouped.heading[award.language] = award.heading;
    }
  });

  return grouped;
};

export const groupEventsByLanguage = (events) => {
  return events.map((event) => ({
    id: event.id,
    title: {
      en: event.titleEn,
      hi: event.titleHi,
      mr: event.titleMr,
    },
    description: {
      en: event.descriptionEn,
      hi: event.descriptionHi,
      mr: event.descriptionMr,
    },
    date: event.eventDate,
    time: event.eventTime,
  }));
};
