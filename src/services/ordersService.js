import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

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

  const count = await prisma.merchandiseOrder.count({
    where: { createdAt: { gte: startOfDay, lt: endOfDay } },
  });

  const seq = String(count + 1).padStart(3, '0');
  return `MCR-${dateStr}-${seq}`;
}

export const ordersService = {
  // ─── Create new order (called after payment) ───────────────────────────
  async create(data) {
    const orderNo = await generateOrderNo();

    const order = await prisma.merchandiseOrder.create({
      data: {
        orderNo,
        customerName:  data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        productName:   data.productName,
        productId:     data.productId   || null,
        size:          data.size,
        quantity:      Number(data.quantity),
        unitPrice:     Number(data.unitPrice),
        totalAmount:   Number(data.totalAmount),
        paymentMethod: data.paymentMethod || 'online',
        paymentId:     data.paymentId    || null,
        status:        data.paymentMethod === 'pickup' ? 'pending' : 'confirmed',
      },
    });

    return order;
  },

  // ─── Get all orders (admin) with optional filters ──────────────────────
  async getAll({ status, search, page = 1, limit = 50 } = {}) {
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName:  { contains: search } },
        { customerEmail: { contains: search } },
        { customerPhone: { contains: search } },
        { orderNo:       { contains: search } },
      ];
    }

    const skip  = (page - 1) * limit;
    const total = await prisma.merchandiseOrder.count({ where });

    const orders = await prisma.merchandiseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    });

    return {
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  },

  // ─── Get order stats (admin) ─────────────────────────────────────────────
  async getStats() {
    const [total, pending, pickedup, revenueAggregate] = await Promise.all([
      prisma.merchandiseOrder.count(),
      prisma.merchandiseOrder.count({ where: { status: 'pending' } }),
      prisma.merchandiseOrder.count({ where: { status: 'picked_up' } }),
      prisma.merchandiseOrder.aggregate({
        where: { NOT: { status: 'cancelled' } },
        _sum: { totalAmount: true }
      })
    ]);

    return {
      total,
      pending,
      pickedup,
      revenue: revenueAggregate._sum.totalAmount || 0
    };
  },

  // ─── Get single order (admin) ───────────────────────────────────────────
  async getById(id) {
    const order = await prisma.merchandiseOrder.findUnique({ where: { id } });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  },

  // ─── Update status (admin) ──────────────────────────────────────────────
  async updateStatus(id, status, notes, adminId) {
    const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'picked_up'];
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const existing = await prisma.merchandiseOrder.findUnique({ where: { id } });
    if (!existing) throw new AppError('Order not found', 404);

    const updated = await prisma.merchandiseOrder.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action:   'UPDATE_STATUS',
        entity:   'merchandise_order',
        entityId: id,
        changes:  { before: { status: existing.status }, after: { status } },
        adminId:  adminId || 'system',
      },
    });

    return updated;
  },
};
