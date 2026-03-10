import crypto from "crypto";
import axios from "axios";
import { query, queryOne } from "../db/postgres/client";
import {
  NotFoundError,
  ForbiddenError,
  AppError,
  ConflictError,
} from "../middleware/errorHandler";
import { env } from "../config/env";
import { resolveGateway } from "@eventshere/shared";
import { InitPaymentDto } from "../schemas/payment.schemas";
import {
  flutterwaveInitialize,
  flutterwaveVerify,
  verifyFlutterwaveWebhook,
} from "./payment.flutterwave";
import {
  stripeInitialize,
  stripeVerify,
  constructStripeEvent,
} from "./payment.stripe";

// ── Paystack helpers ──────────────────────────────────────────────────────
const PAYSTACK_BASE = "https://api.paystack.co";
const paystackHeaders = () => ({
  Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

// ── Main gateway-aware initialize ─────────────────────────────────────────

export async function initializePayment(userId: string, dto: InitPaymentDto) {
  const booking = await queryOne<{
    id: string;
    planner_id: string;
    total_amount: number;
    currency: string;
    payment_status: string;
  }>(
    `SELECT id, planner_id, total_amount, currency, payment_status FROM bookings WHERE id = $1`,
    [dto.bookingId],
  );
  if (!booking) throw new NotFoundError("Booking");
  if (booking.planner_id !== userId) throw new ForbiddenError();
  if (booking.payment_status === "paid")
    throw new ConflictError("Booking already paid");

  const currency = booking.currency || "NGN";
  const gateway = resolveGateway(currency);
  const redirectUrl = `${env.CLIENT_URL}/bookings/${dto.bookingId}?payment=success`;

  let result: { authorizationUrl: string; reference: string };

  if (gateway === "paystack") {
    const { data } = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email: dto.email,
        amount: Math.round(booking.total_amount * 100),
        currency,
        metadata: { bookingId: dto.bookingId, userId },
      },
      { headers: paystackHeaders() },
    );
    result = {
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  } else if (gateway === "flutterwave") {
    result = await flutterwaveInitialize({
      email: dto.email,
      amount: booking.total_amount,
      currency,
      bookingId: dto.bookingId,
      userId,
      redirectUrl,
    });
  } else {
    // Stripe
    result = await stripeInitialize({
      email: dto.email,
      amount: booking.total_amount,
      currency,
      bookingId: dto.bookingId,
      userId,
    });
  }

  await query(
    `UPDATE bookings SET payment_ref = $1, gateway = $2, updated_at = NOW() WHERE id = $3`,
    [result.reference, gateway, dto.bookingId],
  );

  return {
    authorizationUrl: result.authorizationUrl,
    reference: result.reference,
    gateway,
  };
}

// ── Webhook handler — dispatches to the right gateway ────────────────────

export async function handleWebhook(
  headers: Record<string, string>,
  rawBody: string,
  payload: any,
): Promise<void> {
  // ── Paystack ──────────────────
  const paystackSig = headers["x-paystack-signature"];
  if (paystackSig) {
    const expected = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");
    if (expected !== paystackSig)
      throw new AppError("Invalid Paystack webhook signature", 401);

    if (payload.event === "charge.success") {
      await confirmByRef(payload.data.reference);
    }
    return;
  }

  // ── Flutterwave ───────────────
  const flwSig = headers["verif-hash"];
  if (flwSig) {
    if (!verifyFlutterwaveWebhook(flwSig, rawBody)) {
      throw new AppError("Invalid Flutterwave webhook signature", 401);
    }
    if (
      payload.event === "charge.completed" &&
      payload.data.status === "successful"
    ) {
      const verified = await flutterwaveVerify(String(payload.data.id));
      if (verified.bookingId) await confirmBooking(verified.bookingId);
    }
    return;
  }

  // ── Stripe ────────────────────
  const stripeSig = headers["stripe-signature"];
  if (stripeSig) {
    const event = constructStripeEvent(Buffer.from(rawBody), stripeSig);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      if (session.metadata?.bookingId)
        await confirmBooking(session.metadata.bookingId);
    }
    return;
  }

  throw new AppError("Unknown webhook source", 400);
}

async function confirmByRef(reference: string) {
  const booking = await queryOne<{ id: string }>(
    `SELECT id FROM bookings WHERE payment_ref = $1`,
    [reference],
  );
  if (booking) await confirmBooking(booking.id);
}

async function confirmBooking(bookingId: string) {
  await query(
    `UPDATE bookings SET payment_status = 'paid', status = 'confirmed', updated_at = NOW() WHERE id = $1`,
    [bookingId],
  );
}

// ── Verify by reference (Paystack only — Stripe uses session ID) ──────────

export async function verifyPayment(reference: string) {
  const booking = await queryOne<{ gateway: string; id: string }>(
    `SELECT gateway, id FROM bookings WHERE payment_ref = $1`,
    [reference],
  );

  if (!booking) throw new NotFoundError("Booking with that payment reference");

  if (booking.gateway === "stripe") {
    const result = await stripeVerify(reference);
    if (result.status === "paid" && result.bookingId)
      await confirmBooking(result.bookingId);
    return result;
  }

  if (booking.gateway === "flutterwave") {
    const result = await flutterwaveVerify(reference);
    if (result.status === "successful" && result.bookingId)
      await confirmBooking(result.bookingId);
    return { status: result.status, amount: result.amount };
  }

  // Default: Paystack
  const { data } = await axios.get(
    `${PAYSTACK_BASE}/transaction/verify/${reference}`,
    { headers: paystackHeaders() },
  );
  if (data.data.status === "success") {
    const bookingId = data.data.metadata?.bookingId;
    if (bookingId) await confirmBooking(bookingId);
  }
  return { status: data.data.status as string, amount: data.data.amount / 100 };
}
