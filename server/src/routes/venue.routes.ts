import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createVenueSchema, updateVenueSchema, addMediaSchema, blockDateSchema, addReviewSchema } from '../schemas/venue.schemas';
import * as venueController from '../controllers/venue.controller';

const router = Router();

// Public routes
router.get('/',                    venueController.searchVenues);
router.get('/:id',                 venueController.getVenueById);
router.get('/:id/availability',    venueController.getAvailability);
router.get('/:id/reviews',         venueController.getReviews);

// Authenticated routes
router.get('/owner/my',            authenticate, authorize('venue_owner'), venueController.getMyVenues as any);
router.post('/',                   authenticate, authorize('venue_owner'), validate(createVenueSchema),  venueController.createVenue as any);
router.patch('/:id',               authenticate, authorize('venue_owner'), validate(updateVenueSchema),  venueController.updateVenue as any);
router.delete('/:id',              authenticate,                           venueController.deleteVenue as any);
router.post('/:id/media',          authenticate, authorize('venue_owner'), validate(addMediaSchema),     venueController.addMedia as any);
router.delete('/media/:mediaId',   authenticate, authorize('venue_owner'), venueController.deleteMedia as any);
router.post('/:id/availability',   authenticate, authorize('venue_owner'), validate(blockDateSchema),    venueController.setAvailability as any);
router.post('/:id/reviews',        authenticate, authorize('planner'),     validate(addReviewSchema),    venueController.addReview as any);

export default router;
