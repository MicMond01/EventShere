import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createEventSchema, updateEventSchema, addCoPlannerSchema, addRunsheetItemSchema } from '../schemas/event.schemas';
import * as eventController from '../controllers/event.controller';

const router = Router();

// Public
router.get('/public',                   eventController.getPublicEvents);
router.get('/slug/:slug',               eventController.getEventBySlug);

// Authenticated
router.get('/my',                       authenticate, eventController.getMyEvents as any);
router.post('/',                        authenticate, validate(createEventSchema),    eventController.createEvent as any);
router.get('/:id',                      authenticate, eventController.getEventById as any);
router.patch('/:id',                    authenticate, validate(updateEventSchema),    eventController.updateEvent as any);
router.delete('/:id',                   authenticate, eventController.deleteEvent as any);
router.post('/:id/co-planners',         authenticate, validate(addCoPlannerSchema),   eventController.addCoPlanner as any);
router.delete('/:id/co-planners/:userId', authenticate,                               eventController.removeCoPlanner as any);
router.post('/:id/runsheet',            authenticate, validate(addRunsheetItemSchema), eventController.addRunsheetItem as any);
router.patch('/runsheet/:itemId/toggle',authenticate, eventController.toggleRunsheetItem as any);

export default router;
