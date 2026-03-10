import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createEventSchema, updateEventSchema, addCoPlannerSchema, addRunsheetItemSchema } from './event.schemas';
import * as svc from './event.service';

const router = Router();

// Public
router.get('/public',        async (req, res) => { res.json({ success: true, data: await svc.getPublicEvents(req.query as any) }); });
router.get('/slug/:slug',    async (req, res) => { res.json({ success: true, data: await svc.getEventBySlug(req.params.slug) }); });

// Planner
router.get ('/my',           authenticate,                           async (req, res) => { res.json({ success: true, data: await svc.getMyEvents(req.user!.userId) }); });
router.post('/',             authenticate, validate(createEventSchema), async (req, res) => { res.status(201).json({ success: true, data: await svc.createEvent(req.user!.userId, req.body) }); });
router.get ('/:id',          authenticate,                           async (req, res) => { res.json({ success: true, data: await svc.getEventById(req.params.id, req.user!.userId) }); });
router.patch('/:id',         authenticate, validate(updateEventSchema), async (req, res) => { res.json({ success: true, data: await svc.updateEvent(req.params.id, req.user!.userId, req.body) }); });
router.delete('/:id',        authenticate,                           async (req, res) => { await svc.deleteEvent(req.params.id, req.user!.userId); res.json({ success: true }); });

// Co-planners
router.post  ('/:id/co-planners',         authenticate, validate(addCoPlannerSchema), async (req, res) => { await svc.addCoPlanner(req.params.id, req.user!.userId, req.body); res.json({ success: true }); });
router.delete('/:id/co-planners/:userId', authenticate,                               async (req, res) => { await svc.removeCoPlanner(req.params.id, req.user!.userId, req.params.userId); res.json({ success: true }); });

// Runsheet
router.post ('/:id/runsheet',      authenticate, validate(addRunsheetItemSchema), async (req, res) => { res.status(201).json({ success: true, data: await svc.addRunsheetItem(req.params.id, req.user!.userId, req.body) }); });
router.patch('/runsheet/:itemId',  authenticate,                                  async (req, res) => { res.json({ success: true, data: await svc.toggleRunsheetItem(req.params.itemId, req.user!.userId) }); });

export default router;
