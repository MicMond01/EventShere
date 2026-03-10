import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createVenueSchema, updateVenueSchema, addMediaSchema, blockDateSchema } from './venue.schemas';
import * as svc from './venue.service';

const router = Router();

// Public
router.get ('/',                                                  async (req, res) => { res.json({ success: true, data: await svc.searchVenues(req.query as any) }); });
router.get ('/my',      authenticate, authorize('venue_owner'),   async (req, res) => { res.json({ success: true, data: await svc.getMyVenues(req.user!.userId) }); });
router.get ('/:id',                                               async (req, res) => { res.json({ success: true, data: await svc.getVenueById(req.params.id) }); });
router.get ('/:id/availability',                                  async (req, res) => { res.json({ success: true, data: await svc.getAvailability(req.params.id, req.query.month as string) }); });
router.get ('/:id/reviews',                                       async (req, res) => { res.json({ success: true, data: await svc.getReviews(req.params.id) }); });

// Venue owner actions
router.post('/',        authenticate, authorize('venue_owner'), validate(createVenueSchema),   async (req, res) => { res.status(201).json({ success: true, data: await svc.createVenue(req.user!.userId, req.body) }); });
router.patch('/:id',   authenticate, authorize('venue_owner'), validate(updateVenueSchema),   async (req, res) => { res.json({ success: true, data: await svc.updateVenue(req.params.id, req.user!.userId, req.body) }); });
router.delete('/:id',  authenticate,                                                           async (req, res) => { await svc.deleteVenue(req.params.id, req.user!.userId, req.user!.role); res.json({ success: true }); });
router.post ('/:id/media',          authenticate, authorize('venue_owner'), validate(addMediaSchema),   async (req, res) => { res.status(201).json({ success: true, data: await svc.addMedia(req.params.id, req.user!.userId, req.body) }); });
router.delete('/media/:mediaId',    authenticate, authorize('venue_owner'),                             async (req, res) => { await svc.deleteMedia(req.params.mediaId, req.user!.userId); res.json({ success: true }); });
router.post ('/:id/availability',   authenticate, authorize('venue_owner'), validate(blockDateSchema),  async (req, res) => { await svc.setAvailability(req.params.id, req.user!.userId, req.body); res.json({ success: true }); });
router.post ('/:id/reviews',        authenticate, authorize('planner'),                                 async (req, res) => { res.status(201).json({ success: true, data: await svc.addReview(req.params.id, req.user!.userId, req.body) }); });

export default router;
