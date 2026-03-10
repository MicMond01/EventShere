import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { sendInvitationsSchema, rsvpRespondSchema, sendSeatNotificationsSchema } from '../schemas/invitation.schemas';
import * as invitationController from '../controllers/invitation.controller';

const router = Router();

// Public — guest submits their RSVP
router.post('/rsvp',                          validate(rsvpRespondSchema),           invitationController.handleRsvp);

// Planner actions
router.post ('/:eventId/send',                authenticate, validate(sendInvitationsSchema),       invitationController.sendInvitations as any);
router.post ('/:eventId/send-seats',          authenticate, validate(sendSeatNotificationsSchema), invitationController.sendSeatNotifications as any);
router.get  ('/:eventId/stats',               authenticate, invitationController.getInvitationStats as any);

export default router;
