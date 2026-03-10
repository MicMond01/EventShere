import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addGuestSchema, bulkAddGuestsSchema, updateGuestSchema, checkInSchema } from '../schemas/guest.schemas';
import * as guestController from '../controllers/guest.controller';

const router = Router();

// Public — guest views their own invite by token
router.get('/invite/:token',                      guestController.getGuestByToken);

// Event guest management
router.get   ('/:eventId',                        authenticate, guestController.getGuests as any);
router.post  ('/:eventId',                        authenticate, validate(addGuestSchema),       guestController.addGuest as any);
router.post  ('/:eventId/bulk',                   authenticate, validate(bulkAddGuestsSchema),  guestController.bulkAddGuests as any);
router.patch ('/:eventId/:guestId',               authenticate, validate(updateGuestSchema),    guestController.updateGuest as any);
router.delete('/:eventId/:guestId',               authenticate, guestController.removeGuest as any);

// Check-in
router.post  ('/:eventId/checkin',                authenticate, validate(checkInSchema),        guestController.checkInGuest as any);
router.get   ('/:eventId/checkin/stats',          authenticate, guestController.getCheckinStats as any);

export default router;
