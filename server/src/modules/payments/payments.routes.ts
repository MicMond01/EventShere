import { Router, Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import crypto from 'crypto';
import { query, queryOne } from '../../db/postgres/client';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { NotFoundError, ForbiddenError, AppError } from '../../middleware/errorHandler';

const PAYSTACK_BASE = 'https://api.paystack.co';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

function paystackHeaders() {
  return { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' };
}

// ── Schemas ───────────────────────────────────────────────

const initPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  email:     z.string().email(),
});

// ── Handlers ──────────────────────────────────────────────

// POST /api/v1/payments/initialize
async function initializePayment(req: Request, res: Response) {
  const { bookingId, email } = req.body as z.infer<typeof initPaymentSchema>;

  const booking = await queryOne<{ id: string; planner_id: string; total_amount: number; currency: string; payment_status: string }>(
    `SELECT id, planner_id, total_amount, currency, payment_status FROM bookings WHERE id = $1`, [bookingId]
  );
  if (!booking) throw new NotFoundError('Booking');
  if (booking.planner_id !== req.user!.userId) throw new ForbiddenError();
  if (booking.payment_status === 'paid') throw new AppError('Booking already paid', 409);

  // Paystack expects amount in kobo (NGN * 100)
  const amountKobo = Math.round(booking.total_amount * 100);

  const { data } = await axios.post(
    `${PAYSTACK_BASE}/transaction/initialize`,
    { email, amount: amountKobo, metadata: { bookingId, userId: req.user!.userId }, currency: booking.currency || 'NGN' },
    { headers: paystackHeaders() }
  );

  // Store reference
  await query(`UPDATE bookings SET paystack_ref = $1 WHERE id = $2`, [data.data.reference, bookingId]);

  res.json({ success: true, data: { authorizationUrl: data.data.authorization_url, reference: data.data.reference } });
}

// POST /api/v1/payments/webhook — Paystack webhook (no auth, verified by HMAC)
async function handleWebhook(req: Request, res: Response) {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;

  if (event === 'charge.success') {
    const reference = data.reference;
    const booking = await queryOne<{ id: string }>(
      `SELECT id FROM bookings WHERE paystack_ref = $1`, [reference]
    );
    if (booking) {
      await query(
        `UPDATE bookings SET payment_status = 'paid', status = 'confirmed', updated_at = NOW() WHERE id = $1`,
        [booking.id]
      );
    }
  }

  res.sendStatus(200);
}

// GET /api/v1/payments/verify/:reference
async function verifyPayment(req: Request, res: Response) {
  const { data } = await axios.get(
    `${PAYSTACK_BASE}/transaction/verify/${req.params.reference}`,
    { headers: paystackHeaders() }
  );

  if (data.data.status === 'success') {
    const bookingId = data.data.metadata?.bookingId;
    if (bookingId) {
      await query(
        `UPDATE bookings SET payment_status = 'paid', status = 'confirmed', updated_at = NOW() WHERE id = $1`,
        [bookingId]
      );
    }
  }

  res.json({ success: true, data: { status: data.data.status, amount: data.data.amount / 100 } });
}

// ── Router ────────────────────────────────────────────────

const router = Router();

router.post('/initialize',       authenticate, validate(initPaymentSchema), initializePayment);
router.post('/webhook',          handleWebhook); // No authenticate — Paystack calls this
router.get ('/verify/:reference', authenticate, verifyPayment);

export default router;
