import axios from 'axios';
import crypto from 'crypto';
import { query, queryOne } from '../db/postgres/client';
import { NotFoundError, ForbiddenError, AppError, ConflictError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { InitPaymentDto } from '../schemas/payment.schemas';

const BASE = 'https://api.paystack.co';
const headers = () => ({ Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' });

export async function initializePayment(userId: string, dto: InitPaymentDto) {
  const booking = await queryOne<{ id: string; planner_id: string; total_amount: number; currency: string; payment_status: string }>(
    `SELECT id,planner_id,total_amount,currency,payment_status FROM bookings WHERE id = $1`, [dto.bookingId]
  );
  if (!booking) throw new NotFoundError('Booking');
  if (booking.planner_id !== userId) throw new ForbiddenError();
  if (booking.payment_status === 'paid') throw new ConflictError('Booking already paid');

  const { data } = await axios.post(
    `${BASE}/transaction/initialize`,
    { email: dto.email, amount: Math.round(booking.total_amount * 100), currency: booking.currency || 'NGN',
      metadata: { bookingId: dto.bookingId, userId } },
    { headers: headers() }
  );
  await query(`UPDATE bookings SET paystack_ref = $1 WHERE id = $2`, [data.data.reference, dto.bookingId]);
  return { authorizationUrl: data.data.authorization_url, reference: data.data.reference };
}

export async function handleWebhook(signature: string, rawBody: string, payload: any): Promise<void> {
  const expected = crypto.createHmac('sha512', env.PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
  if (expected !== signature) throw new AppError('Invalid webhook signature', 401);

  if (payload.event === 'charge.success') {
    const booking = await queryOne<{ id: string }>(
      `SELECT id FROM bookings WHERE paystack_ref = $1`, [payload.data.reference]
    );
    if (booking) {
      await query(
        `UPDATE bookings SET payment_status='paid', status='confirmed', updated_at=NOW() WHERE id=$1`, [booking.id]
      );
    }
  }
}

export async function verifyPayment(reference: string) {
  const { data } = await axios.get(`${BASE}/transaction/verify/${reference}`, { headers: headers() });
  if (data.data.status === 'success') {
    const bookingId = data.data.metadata?.bookingId;
    if (bookingId) {
      await query(
        `UPDATE bookings SET payment_status='paid', status='confirmed', updated_at=NOW() WHERE id=$1`, [bookingId]
      );
    }
  }
  return { status: data.data.status, amount: data.data.amount / 100 };
}
