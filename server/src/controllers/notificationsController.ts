import { Request, Response } from "express";
import prisma from "../database/prisma.js";
import { sendNotificationEmail } from "../utils/emailService.js";

/**
 * Obtener todas las notificaciones del usuario autenticado
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(notifications);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

/**
 * Marcar una notificación como leída
 */
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return res.json(updatedNotification);
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    return res
      .status(500)
      .json({ error: "Error al marcar notificación como leída" });
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return res.json({
      message: "Todas las notificaciones marcadas como leídas",
    });
  } catch (error) {
    console.error("Error al marcar todas las notificaciones:", error);
    return res
      .status(500)
      .json({ error: "Error al marcar todas las notificaciones" });
  }
};

/**
 * Obtener el contador de notificaciones no leídas
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    return res.json({ count });
  } catch (error) {
    console.error("Error al obtener contador de notificaciones:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener contador de notificaciones" });
  }
};

/**
 * Crear una nueva notificación (usado internamente por otros controladores)
 */
export const createNotification = async (
  userId: string,
  type: "GENERAL" | "MENTION" | "INBOX" | "FILE",
  title: string,
  description: string,
  actorName: string,
) => {
  try {
    // Crear la notificación en la base de datos
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        description,
        actorName,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            emailNotifications: true,
          },
        },
      },
    });

    // Enviar email si el usuario tiene las notificaciones por email activadas
    if (notification.user.emailNotifications) {
      // Ejecutar de forma asíncrona sin bloquear
      sendNotificationEmail(
        notification.user.email,
        notification.user.name,
        type,
        title,
        description,
      ).catch((error) => {
        console.error("Error al enviar email de notificación:", error);
      });
    }

    return notification;
  } catch (error) {
    console.error("Error al crear notificación:", error);
    throw error;
  }
};
