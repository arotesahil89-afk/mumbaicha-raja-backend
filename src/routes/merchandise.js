import express from 'express';
import { Op } from 'sequelize';
import MerchandiseProduct from '../models/MerchandiseProduct.js';

const router = express.Router();

// GET all merchandise products
router.get('/', async (req, res, next) => {
  try {
    const products = await MerchandiseProduct.findAll({
      where: { active: true }
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// POST sync merchandise products list
router.post('/sync', async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ success: false, error: 'Products list must be an array' });
    }

    // Save / Sync each product
    for (const p of products) {
      const exists = await MerchandiseProduct.findByPk(p.id);
      const productPayload = {
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        price: p.price,
        oldPrice: p.oldPrice,
        sizes: p.sizes,
        stock: p.stock,
        type: p.type,
        color: p.color,
        colorName: p.colorName,
        image: p.image,
        gallery: p.gallery,
        rating: p.rating,
        reviews: p.reviews,
        highlights: p.highlights,
        specs: p.specs,
        active: p.active !== undefined ? p.active : true
      };

      if (exists) {
        await exists.update(productPayload);
      } else {
        await MerchandiseProduct.create({
          id: p.id,
          ...productPayload
        });
      }
    }

    // Mark deleted / omitted products as inactive
    const incomingIds = products.map(p => p.id);
    await MerchandiseProduct.update(
      { active: false },
      {
        where: {
          id: {
            [Op.notIn]: incomingIds
          }
        }
      }
    );

    res.json({ success: true, message: 'Merchandise products synced successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
