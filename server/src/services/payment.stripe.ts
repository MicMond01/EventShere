import Stripe from "stripe";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

// Only instantiate Stripe if the key is provided
function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError("Stripe is not configured for this environment", 503);
  }
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" });
}

export async function stripeInitialize(opts: {
  email: string;
  amount: number;
  currency: string;
  bookingId: string;
  userId: string;
}) {
  const stripe = getStripe();
  // Stripe amounts are in smallest currency unit (cents/pence/etc.)
  const unitAmount = Math.round(opts.amount * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: opts.email,
    line_items: [
      {
        price_data: {
          currency: opts.currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: { name: "EventShere Venue Booking" },
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: opts.bookingId, userId: opts.userId },
    success_url: `${env.CLIENT_URL}/bookings/${opts.bookingId}?payment=success`,
    cancel_url: `${env.CLIENT_URL}/bookings/${opts.bookingId}?payment=cancelled`,
  });

  return {
    authorizationUrl: session.url as string,
    reference: session.id,
  };
}

export async function stripeVerify(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.payment_status,
    amount: (session.amount_total ?? 0) / 100,
    currency: session.currency?.toUpperCase() ?? "",
    bookingId: session.metadata?.bookingId,
  };
}

export function constructStripeEvent(
  payload: Buffer,
  signature: string,
): Stripe.Event {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError("Stripe webhook secret not configured", 503);
  }
  const stripe = getStripe();
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    throw new AppError("Invalid Stripe webhook signature", 401);
  }
}
