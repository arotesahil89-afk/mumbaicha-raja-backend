import Admin from '../models/Admin.js';
import { hashPassword } from '../utils/helpers.js';

export const adminController = {
  // GET /api/admins
  getAdmins: async (req, res, next) => {
    try {
      const admins = await Admin.findAll({
        attributes: { exclude: ['password'] }
      });
      res.json({ success: true, admins });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/admins
  createAdmin: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      
      const existing = await Admin.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      const hashedPassword = await hashPassword(password);
      const admin = await Admin.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'admin'
      });

      const adminData = admin.toJSON();
      delete adminData.password;
      
      res.status(201).json({ success: true, admin: adminData });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/admins/:id
  updateAdmin: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, password, role, active } = req.body;

      const admin = await Admin.findByPk(id);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }

      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (role) updates.role = role;
      if (active !== undefined) updates.active = active;
      if (password) {
        updates.password = await hashPassword(password);
      }

      await admin.update(updates);

      const adminData = admin.toJSON();
      delete adminData.password;

      res.json({ success: true, admin: adminData });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/admins/:id
  deleteAdmin: async (req, res, next) => {
    try {
      const { id } = req.params;
      const admin = await Admin.findByPk(id);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }

      await admin.destroy();
      res.json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};
