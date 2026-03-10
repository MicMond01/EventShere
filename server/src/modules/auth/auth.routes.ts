import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema } from './auth.schemas';
import * as controller from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login',    validate(loginSchema),    controller.login);
router.post('/refresh',                            controller.refresh);
router.post('/logout',                             controller.logout);
router.get ('/me',       authenticate,             controller.me);

export default router;
