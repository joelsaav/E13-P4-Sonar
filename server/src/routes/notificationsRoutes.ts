import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:id/read", markNotificationAsRead);
router.patch("/read-all", markAllNotificationsAsRead);

export default router;
