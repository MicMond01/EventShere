import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { saveLayoutSchema } from '../schemas/layout.schemas';
import * as layoutController from '../controllers/layout.controller';

const router = Router();

router.get   ('/:eventId',                    authenticate, layoutController.getLayouts as any);
router.get   ('/:eventId/active',             authenticate, layoutController.getActiveLayout);
router.get   ('/:eventId/seats',              authenticate, layoutController.getSeats);
router.get   ('/:eventId/:layoutId',          authenticate, layoutController.getLayoutById as any);
router.post  ('/:eventId',                    authenticate, validate(saveLayoutSchema), layoutController.saveLayout as any);
router.patch ('/:eventId/:layoutId/activate', authenticate, layoutController.activateLayout as any);
router.delete('/:eventId/:layoutId',          authenticate, layoutController.deleteLayout as any);

export default router;
