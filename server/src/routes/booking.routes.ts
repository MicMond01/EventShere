import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema, respondBookingSchema } from '../schemas/booking.schemas';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

router.get ('/',                authenticate,                           bookingController.getMyBookings as any);
router.get ('/:id',             authenticate,                           bookingController.getBookingById as any);
router.post('/',                authenticate, authorize('planner'),     validate(createBookingSchema),   bookingController.createBooking as any);
router.patch('/:id/respond',    authenticate, authorize('venue_owner'), validate(respondBookingSchema),  bookingController.respondToBooking as any);
router.patch('/:id/confirm',    authenticate, authorize('planner'),                                      bookingController.confirmBooking as any);

export default router;
