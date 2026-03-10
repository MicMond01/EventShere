import { Request, Response } from "express";
import { AuthRequest } from "../types";
import * as paymentService from "../services/payment.service";

export async function initializePayment(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const data = await paymentService.initializePayment(
    req.user.userId,
    req.body,
  );
  res.json({ success: true, data });
}

export async function handleWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  // Pass the full headers object so the multi-gateway router can detect the source
  const rawBody = JSON.stringify(req.body);
  await paymentService.handleWebhook(
    req.headers as Record<string, string>,
    rawBody,
    req.body,
  );
  res.sendStatus(200);
}

export async function verifyPayment(
  req: Request,
  res: Response,
): Promise<void> {
  const data = await paymentService.verifyPayment(req.params.reference);
  res.json({ success: true, data });
}
