'use strict';
import crypto from 'crypto';

export async function up(queryInterface) {
  const now = new Date();

  // Product 1 — Mumbai Cha Raja T-Shirt 2025
  const productId = crypto.randomUUID();

  await queryInterface.bulkInsert('merchandise_products', [
    {
      id: productId,
      name: 'Mumbai Cha Raja T-Shirt 2025',
      description: 'Official Mumbai Cha Raja Ganesh Festival T-Shirt 2025. Premium quality 100% cotton with exclusive Ganpati design. Available in all sizes.',
      price: 599,
      oldPrice: 799,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      stock: JSON.stringify({ S: 100, M: 150, L: 200, XL: 120, XXL: 80 }),
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ], { ignoreDuplicates: true });
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete('merchandise_products', {
    name: 'Mumbai Cha Raja T-Shirt 2025',
  });
}
