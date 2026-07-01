import { Op } from 'sequelize';
import MerchandiseOrder from '../models/MerchandiseOrder.js';
import AuditLog from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';

// Generate unique order number: MCR-YYYYMMDD-NNN
async function generateOrderNo() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateStr = `${yyyy}${mm}${dd}`;

  // Count orders created today to determine sequence
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const count = await MerchandiseOrder.count({
    where: {
      createdAt: {
        [Op.gte]: startOfDay,
        [Op.lt]: endOfDay,
      },
    },
  });

  const seq = String(count + 1).padStart(3, '0');
  return `MCR-${dateStr}-${seq}`;
}

export const ordersService = {
  // ─── Create new order (called after payment) ───────────────────────────
  async create(data) {
    const orderNo = await generateOrderNo();

const subtotal = Number(data.quantity) * Number(data.unitPrice);
const totalAmount = subtotal;

    const order = await MerchandiseOrder.create({
      orderNo,
      customerName:  data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      address:       null,
      productName:   data.productName,
      productId:     data.productId   || null,
      size:          data.size,
      quantity:      Number(data.quantity),
      unitPrice:     Number(data.unitPrice),
      totalAmount:   totalAmount,
      paymentMethod: data.paymentMethod || 'online',
      paymentId:     data.paymentId    || null,
      status:        data.paymentMethod === 'pickup' ? 'pending' : 'confirmed',
    });

    const updated = await MerchandiseOrder.findByPk(order.id);
    return updated.toJSON();
  },

  // ─── Get all orders (admin) with optional filters ──────────────────────
  async getAll({ status, search, page = 1, limit = 50 } = {}) {
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { customerName:  { [Op.like]: `%${search}%` } },
        { customerEmail: { [Op.like]: `%${search}%` } },
        { customerPhone: { [Op.like]: `%${search}%` } },
        { orderNo:       { [Op.like]: `%${search}%` } },
      ];
    }

    const skip  = (page - 1) * limit;
    const total = await MerchandiseOrder.count({ where });

    const orders = await MerchandiseOrder.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: Number(skip),
      limit: Number(limit),
    });

    return {
      orders: orders.map(o => o.toJSON()),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  },

  // ─── Get order stats (admin) ─────────────────────────────────────────────
  async getStats() {
    const [total, pending, pickedup, revenue] = await Promise.all([
      MerchandiseOrder.count(),
      MerchandiseOrder.count({ where: { status: 'pending' } }),
      MerchandiseOrder.count({ where: { status: 'picked_up' } }),
      MerchandiseOrder.sum('totalAmount', {
        where: {
          status: {
            [Op.ne]: 'cancelled',
          },
        },
      }),
    ]);

    return {
      total,
      pending,
      pickedup,
      revenue: revenue || 0,
    };
  },

  // ─── Get single order (admin) ───────────────────────────────────────────
  async getById(id) {
    const order = await MerchandiseOrder.findByPk(id);
    if (!order) throw new AppError('Order not found', 404);
    return order.toJSON();
  },

  // ─── Update status (admin) ──────────────────────────────────────────────
  async updateStatus(id, status, notes, adminId) {
    const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'picked_up'];
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const existing = await MerchandiseOrder.findByPk(id);
    if (!existing) throw new AppError('Order not found', 404);

    const beforeState = existing.toJSON();

    await MerchandiseOrder.update({
      status,
      ...(notes !== undefined ? { notes } : {}),
    }, {
      where: { id },
    });

    const updated = await MerchandiseOrder.findByPk(id);
    const afterState = updated.toJSON();

    // Audit log
    await AuditLog.create({
      action:   'UPDATE_STATUS',
      entity:   'merchandise_order',
      entityId: id,
      changes:  { before: { status: beforeState.status }, after: { status } },
      adminId:  adminId || 'system',
    });

    return afterState;
  },
};
