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

// POST /api/merchandise/sync - Sync local products with database
router.post('/sync', async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ success: false, error: 'products array is required' });
    }

    for (const p of products) {
      const name = p.name || (p.nameKey ? { en: p.nameKey, hi: p.nameKey, mr: p.nameKey } : { en: p.id, hi: p.id, mr: p.id });
      const tagline = p.tagline || (p.taglineKey ? { en: p.taglineKey, hi: p.taglineKey, mr: p.taglineKey } : null);
      
      let description = null;
      if (p.description) {
        description = typeof p.description === 'object' ? p.description : { en: p.description, hi: p.description, mr: p.description };
      } else if (p.descKey) {
        description = { en: p.descKey, hi: p.descKey, mr: p.descKey };
      }

      let colorName = null;
      if (p.colorName) {
        colorName = typeof p.colorName === 'object' ? p.colorName : { en: p.colorName, hi: p.colorName, mr: p.colorName };
      }

      // Preserve existing keys for legacy frontend compatibility (e.g. reviews count, rating)
      await MerchandiseProduct.upsert({
        id: p.id,
        name,
        tagline,
        description,
        type: p.type || null,
        price: p.price,
        oldPrice: p.oldPrice || null,
        sizes: p.sizes || [],
        stock: p.stock || {},
        color: p.color || null,
        colorName,
        image: p.image || null,
        gallery: p.gallery || null,
        rating: p.rating || 4.8,
        reviews: p.reviews !== undefined ? p.reviews : 0,
        highlights: p.highlights || null,
        specs: p.specs || null,
        active: p.active !== undefined ? p.active : true,
      });
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
