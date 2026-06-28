'use strict';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function up(queryInterface) {
  const now = new Date();
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  await queryInterface.bulkInsert('admins', [
    {
      id: crypto.randomUUID(),
      email: 'admin@mumbaicharaja.com',
      password: hashedPassword,
      role: 'admin',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ], { ignoreDuplicates: true });
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('admins', {
    email: 'admin@mumbaicharaja.com',
  });
}
