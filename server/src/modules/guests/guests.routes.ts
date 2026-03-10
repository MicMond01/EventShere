import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addGuestSchema, updateGuestSchema, bulkAddGuestsSchema } from './guest.schemas';
import * as svc from './guest.service';

const router = Router();

// Public: guest views their own invite by token
router.get('/invite/:token', async (req, res) => {
  res.json({ success: true, data: await svc.getGuestByInvitationToken(req.params.token) });
});

// Planner: manage guests for an event
router.get   ('/:eventId/guests',                     authenticate, async (req, res) => { res.json({ success: true, data: await svc.getGuests(req.params.eventId, req.user!.userId, req.query as any) }); });
router.post  ('/:eventId/guests',                     authenticate, validate(addGuestSchema),       async (req, res) => { res.status(201).json({ success: true, data: await svc.addGuest(req.params.eventId, req.user!.userId, req.body) }); });
router.post  ('/:eventId/guests/bulk',                authenticate, validate(bulkAddGuestsSchema),  async (req, res) => { res.status(201).json({ success: true, data: await svc.bulkAddGuests(req.params.eventId, req.user!.userId, req.body.guests) }); });
router.patch ('/:eventId/guests/:guestId',            authenticate, validate(updateGuestSchema),    async (req, res) => { res.json({ success: true, data: await svc.updateGuest(req.params.guestId, req.user!.userId, req.body) }); });
router.delete('/:eventId/guests/:guestId',            authenticate,                                 async (req, res) => { await svc.removeGuest(req.params.guestId, req.user!.userId); res.json({ success: true }); });

// Check-in
router.post  ('/:eventId/checkin',                    authenticate, async (req, res) => { res.json({ success: true, data: await svc.checkInGuest(req.params.eventId, req.user!.userId, req.body) }); });
router.get   ('/:eventId/checkin/stats',              authenticate, async (req, res) => { res.json({ success: true, data: await svc.getCheckinStats(req.params.eventId, req.user!.userId) }); });

export default router;
