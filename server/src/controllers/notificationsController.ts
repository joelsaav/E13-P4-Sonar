import { Request, Response } from "express";
import prisma from "../database/prisma.js";
import { sendNotificationEmail } from "../utils/emailService.js";
import { getIO } from "../utils/socket.js";

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
    console.error(error);
    return res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

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

    return res.status(200).json(updatedNotification);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Error al marcar notificación como leída" });
  }
};

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

    return res.status(200).json({
      message: "Todas las notificaciones marcadas como leídas",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Error al marcar todas las notificaciones" });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Error al obtener contador de notificaciones" });
  }
};

export const createNotification = async (
  userId: string,
  type: "SYSTEM" | "SHARED" | "EXPIRED",
  title: string,
  description: string,
  actorName: string,
) => {
  try {
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

    getIO().to(`user:${userId}`).emit("notification:created", notification);

    if (notification.user.emailNotifications) {
      sendNotificationEmail(
        notification.user.email,
        notification.user.name,
        type,
        title,
        description,
      ).catch((error) => {
        return error;
      });
    }

    return notification;
  } catch (error) {
    throw error;
  }
};
