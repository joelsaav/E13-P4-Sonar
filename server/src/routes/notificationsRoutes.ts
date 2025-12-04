import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/notifications - Obtener todas las notificaciones del usuario
router.get("/", getNotifications);

// GET /api/notifications/unread-count - Obtener contador de no leídas
router.get("/unread-count", getUnreadCount);

// PATCH /api/notifications/:id/read - Marcar una notificación como leída
router.patch("/:id/read", markNotificationAsRead);

// PATCH /api/notifications/read-all - Marcar todas como leídas
router.patch("/read-all", markAllNotificationsAsRead);

export default router;
