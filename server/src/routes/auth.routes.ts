import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schemas';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login',    validate(loginSchema),    authController.login);
router.post('/refresh',                            authController.refresh);
router.post('/logout',                             authController.logout);
router.get ('/me',       authenticate,             authController.getMe as any);

export default router;
