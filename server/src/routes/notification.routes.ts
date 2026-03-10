import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.get   ('/',            authenticate, notificationController.getNotifications as any);
router.get   ('/unread-count',authenticate, notificationController.getUnreadCount as any);
router.patch ('/:id/read',    authenticate, notificationController.markRead as any);
router.patch ('/read-all',    authenticate, notificationController.markAllRead as any);

export default router;
