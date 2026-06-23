import { PrismaClient } from '@prisma/client';
import { hashPassword } from './helpers.js';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.auditLog.deleteMany();
    await prisma.event.deleteMany();
    await prisma.award.deleteMany();
    await prisma.admin.deleteMany();

    console.log('✓ Cleared existing data');

    // Create default admin
    const adminPassword = await hashPassword(process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe123!');
    const admin = await prisma.admin.create({
      data: {
        email: process.env.INITIAL_ADMIN_EMAIL || 'admin@mumbaicharaja.com',
        password: adminPassword,
        role: 'admin',
        active: true,
      },
    });

    console.log('✓ Created admin:', admin.email);

    // Seed sample awards
    const awards = await prisma.award.createMany({
      data: [
        // English awards
        { language: 'en', text: 'Best Cultural Organization 2024', heading: 'Awards & Recognition', displayOrder: 1 },
        { language: 'en', text: 'Excellence in Heritage Preservation', heading: 'Awards & Recognition', displayOrder: 2 },
        { language: 'en', text: 'Community Spirit Award', heading: 'Awards & Recognition', displayOrder: 3 },

        // Hindi awards
        { language: 'hi', text: 'सर्वश्रेष्ठ सांस्कृतिक संगठन 2024', heading: 'पुरस्कार और मान्यता', displayOrder: 1 },
        { language: 'hi', text: 'विरासत संरक्षण में उत्कृष्टता', heading: 'पुरस्कार और मान्यता', displayOrder: 2 },

        // Marathi awards
        { language: 'mr', text: 'सर्वश्रेष्ठ सांस्कृतिक संस्था 2024', heading: 'पुरस्कार आणि स्वीकृती', displayOrder: 1 },
      ],
    });

    console.log(`✓ Created ${awards.count} awards`);

    // Seed sample events
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);

    const events = await prisma.event.createMany({
      data: [
        {
          titleEn: 'Ganpati Visarjan Sohala',
          titleHi: 'गणपति विसर्जन सोहळा',
          titleMr: 'गणपती विसर्जन सोहळा',
          descriptionEn: 'Celebrate the farewell of Lord Ganpati with traditional rituals and cultural performances',
          descriptionHi: 'भगवान गणपति को परंपरागत रीति-रिवाज और सांस्कृतिक प्रदर्शन के साथ विदा करें',
          descriptionMr: 'भगवान गणपतीला परंपरागत विधी आणि सांस्कृतिक कार्यक्रमांसह निरोप द्या',
          eventDate: nextMonth,
          eventTime: '8:00 AM',
        },
        {
          titleEn: 'Diwali Cultural Celebration',
          titleHi: 'दिवाली सांस्कृतिक समारोह',
          titleMr: 'दिवाळी सांस्कृतिक समारंभ',
          descriptionEn: 'Festival of lights celebration with traditional arts, music, and dance performances',
          descriptionHi: 'पारंपरिक कला, संगीत और नृत्य प्रदर्शन के साथ रोशनी का त्योहार',
          descriptionMr: 'परंपरागत कला, संगीत आणि नृत्य प्रदर्शनासह प्रकाशाचा सण',
          eventDate: new Date(now.getFullYear(), now.getMonth() + 2, 1),
          eventTime: '6:00 PM',
        },
      ],
    });

    console.log(`✓ Created ${events.count} events`);

    console.log('✅ Database seed completed successfully!');
    console.log(`\n📋 Initial Admin Credentials:`);
    console.log(`   Email: ${process.env.INITIAL_ADMIN_EMAIL || 'admin@mumbaicharaja.com'}`);
    console.log(`   Password: ${process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe123!'}`);
    console.log(`\n⚠️  IMPORTANT: Change this password after first login!\n`);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
