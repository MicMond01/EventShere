import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { initPaymentSchema } from '../schemas/payment.schemas';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

router.post('/initialize',         authenticate, validate(initPaymentSchema), paymentController.initializePayment as any);
router.post('/webhook',            paymentController.handleWebhook); // No auth — Paystack calls this directly
router.get ('/verify/:reference',  authenticate, paymentController.verifyPayment);

export default router;
