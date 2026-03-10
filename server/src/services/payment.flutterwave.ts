import axios from "axios";
import crypto from "crypto";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

const BASE = "https://api.flutterwave.com/v3";
const headers = () => ({
  Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
  "Content-Type": "application/json",
});

export async function flutterwaveInitialize(opts: {
  email: string;
  amount: number;
  currency: string;
  bookingId: string;
  userId: string;
  redirectUrl: string;
}) {
  const { data } = await axios.post(
    `${BASE}/payments`,
    {
      tx_ref: `es_${opts.bookingId}_${Date.now()}`,
      amount: opts.amount,
      currency: opts.currency,
      redirect_url: opts.redirectUrl,
      customer: { email: opts.email },
      meta: { bookingId: opts.bookingId, userId: opts.userId },
    },
    { headers: headers() },
  );

  if (data.status !== "success") {
    throw new AppError("Flutterwave payment initialization failed", 502);
  }

  return {
    authorizationUrl: data.data.link as string,
    reference: `es_${opts.bookingId}_${Date.now()}`,
  };
}

export async function flutterwaveVerify(transactionId: string) {
  const { data } = await axios.get(
    `${BASE}/transactions/${transactionId}/verify`,
    { headers: headers() },
  );
  return {
    status: data.data.status as string,
    amount: data.data.amount as number,
    currency: data.data.currency as string,
    bookingId: data.data.meta?.bookingId as string | undefined,
  };
}

export function verifyFlutterwaveWebhook(
  signature: string,
  body: string,
): boolean {
  const hash = crypto
    .createHmac("sha256", env.FLUTTERWAVE_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}
