import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import venueRoutes from "./venue.routes";
import eventRoutes from "./event.routes";
import guestRoutes from "./guest.routes";
import bookingRoutes from "./booking.routes";
import layoutRoutes from "./layout.routes";
import invitationRoutes from "./invitation.routes";
import ratingRoutes from "./rating.routes";
import paymentRoutes from "./payment.routes";
import seatingRoutes from "./seating.routes";
import notificationRoutes from "./notification.routes";
import searchRoutes from "./search.routes";
import uploadRoutes from "./upload.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/venues", venueRoutes);
router.use("/events", eventRoutes);
router.use("/guests", guestRoutes);
router.use("/bookings", bookingRoutes);
router.use("/layouts", layoutRoutes);
router.use("/invitations", invitationRoutes);
router.use("/ratings", ratingRoutes);
router.use("/payments", paymentRoutes);
router.use("/seating", seatingRoutes);
router.use("/notifications", notificationRoutes);
router.use("/search", searchRoutes);
router.use("/uploads", uploadRoutes);
router.use("/admin", adminRoutes);

export default router;
