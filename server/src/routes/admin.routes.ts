import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get   ('/stats',              adminController.getPlatformStats);
router.get   ('/users',              adminController.listUsers);
router.patch ('/users/:id/status',   adminController.updateUserStatus);
router.get   ('/venues/pending',     adminController.getPendingVenues);
router.patch ('/venues/:id/review',  adminController.reviewVenue);
router.get   ('/ratings/flagged',    adminController.getFlaggedRatings);
router.delete('/ratings/:id',        adminController.deleteRating);
router.get   ('/events',             adminController.getEvents);
router.patch ('/events/:id/status',  adminController.updateEventStatus);
router.delete('/events/:id',         adminController.deleteEvent);
router.get   ('/bookings',           adminController.getBookings);
router.patch ('/bookings/:id/status',adminController.updateBookingStatus);
router.delete('/bookings/:id',       adminController.deleteBooking);

export default router;
