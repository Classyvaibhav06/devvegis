import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config/env';

const razorpay = new Razorpay({ key_id: config.RAZORPAY_KEY_ID, key_secret: config.RAZORPAY_KEY_SECRET });

export const createRazorpayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId } = req.body;
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) throw new AppError('Payment record not found', 404);

  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(payment.amount * 100),
    currency: 'INR',
    receipt: orderId,
    notes: { orderId, userId: req.user!.id },
  });

  await prisma.payment.update({ where: { orderId }, data: { razorpayOrderId: rzpOrder.id } });

  res.json({ success: true, data: { razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: config.RAZORPAY_KEY_ID } });
};

export const verifyRazorpayPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const signature = crypto.createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (signature !== razorpay_signature) throw new AppError('Invalid payment signature', 400);

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId },
      data: { status: 'PAID', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, paidAt: new Date() },
    });
    await tx.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
    
    // Add cashback
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (order) {
      const cashback = Math.floor(order.totalAmount * 0.02);
      if (cashback > 0) {
        const wallet = await tx.wallet.update({ where: { userId: req.user!.id }, data: { balance: { increment: cashback }, totalCredits: { increment: cashback } } });
        await tx.walletTransaction.create({ data: { walletId: wallet.id, type: 'CASHBACK', amount: cashback, balance: wallet.balance, description: `2% cashback on order #${order.orderNumber}`, orderId } });
      }
    }
  });

  res.json({ success: true, message: 'Payment verified successfully' });
};

export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({ where: { userId: req.user!.id }, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, include: { order: { select: { orderNumber: true, totalAmount: true } } } }),
    prisma.payment.count({ where: { userId: req.user!.id } }),
  ]);
  res.json({ success: true, data: payments, pagination: { page: parseInt(page), total } });
};
