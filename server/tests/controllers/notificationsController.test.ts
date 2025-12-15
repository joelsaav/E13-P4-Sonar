import { Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../src/controllers/notificationsController";
import prisma from "../../src/database/prisma";
import { sendNotificationEmail } from "../../src/utils/emailService";

interface RequestWithUser {
  user?: { id: string; email: string; name: string };
  params: Record<string, string>;
  body: Record<string, unknown>;
}

vi.mock("../../src/database/prisma", () => ({
  default: {
    notification: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../../src/utils/emailService", () => ({
  sendNotificationEmail: vi.fn(),
}));

vi.mock("../../src/utils/socket", () => ({
  getIO: vi.fn().mockReturnValue({
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  }),
}));

describe("NotificationsController", () => {
  let mockReq: Partial<RequestWithUser>;
  let mockRes: Partial<Response>;
  let jsonMock: Mock;
  let statusMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnThis();

    mockReq = {
      user: { id: "user123", email: "test@test.com", name: "Test User" },
      params: {},
      body: {},
    };

    mockRes = {
      json: jsonMock,
      status: statusMock,
    };
  });

  describe("getNotifications", () => {
    it("should return all notifications for authenticated user", async () => {
      const mockNotifications = [
        {
          id: "notif1",
          userId: "user123",
          type: "GENERAL",
          title: "Test",
          description: "Desc",
          read: false,
          createdAt: new Date(),
        },
      ];

      (prisma.notification.findMany as Mock).mockResolvedValue(
        mockNotifications,
      );

      await getNotifications(mockReq as never, mockRes as Response);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: "user123" },
        orderBy: { createdAt: "desc" },
      });
      expect(jsonMock).toHaveBeenCalledWith(mockNotifications);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;

      await getNotifications(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Usuario no autenticado",
      });
    });

    it("should handle database errors", async () => {
      (prisma.notification.findMany as Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      await getNotifications(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error al obtener notificaciones",
      });
    });
  });

  describe("markNotificationAsRead", () => {
    it("should mark notification as read", async () => {
      mockReq.params = { id: "notif1" };

      const mockNotification = {
        id: "notif1",
        userId: "user123",
        read: false,
      };

      const updatedNotification = { ...mockNotification, read: true };

      (prisma.notification.findFirst as Mock).mockResolvedValue(
        mockNotification,
      );
      (prisma.notification.update as Mock).mockResolvedValue(
        updatedNotification,
      );

      await markNotificationAsRead(mockReq as never, mockRes as Response);

      expect(prisma.notification.findFirst).toHaveBeenCalledWith({
        where: { id: "notif1", userId: "user123" },
      });
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: "notif1" },
        data: { read: true },
      });
      expect(jsonMock).toHaveBeenCalledWith(updatedNotification);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "notif1" };

      await markNotificationAsRead(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Usuario no autenticado",
      });
    });

    it("should return 404 if notification not found", async () => {
      mockReq.params = { id: "nonexistent" };
      (prisma.notification.findFirst as Mock).mockResolvedValue(null);

      await markNotificationAsRead(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Notificación no encontrada",
      });
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "notif1" };
      (prisma.notification.findFirst as Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      await markNotificationAsRead(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error al marcar notificación como leída",
      });
    });
  });

  describe("markAllNotificationsAsRead", () => {
    it("should mark all notifications as read", async () => {
      (prisma.notification.updateMany as Mock).mockResolvedValue({ count: 5 });

      await markAllNotificationsAsRead(mockReq as never, mockRes as Response);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: "user123", read: false },
        data: { read: true },
      });
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Todas las notificaciones marcadas como leídas",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;

      await markAllNotificationsAsRead(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Usuario no autenticado",
      });
    });

    it("should handle database errors", async () => {
      (prisma.notification.updateMany as Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      await markAllNotificationsAsRead(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error al marcar todas las notificaciones",
      });
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread notifications count", async () => {
      (prisma.notification.count as Mock).mockResolvedValue(3);

      await getUnreadCount(mockReq as never, mockRes as Response);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: "user123", read: false },
      });
      expect(jsonMock).toHaveBeenCalledWith({ count: 3 });
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;

      await getUnreadCount(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Usuario no autenticado",
      });
    });

    it("should handle database errors", async () => {
      (prisma.notification.count as Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      await getUnreadCount(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error al obtener contador de notificaciones",
      });
    });

    it("should return 0 when user has no unread notifications", async () => {
      (prisma.notification.count as Mock).mockResolvedValue(0);

      await getUnreadCount(mockReq as never, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ count: 0 });
    });
  });

  describe("createNotification", () => {
    it("should create notification and send email if enabled", async () => {
      const mockNotification = {
        id: "notif1",
        userId: "user123",
        type: "SYSTEM",
        title: "Test",
        description: "Desc",
        actorName: "Actor",
        user: {
          email: "test@test.com",
          name: "Test User",
          emailNotifications: true,
        },
      };

      (prisma.notification.create as Mock).mockResolvedValue(mockNotification);
      (sendNotificationEmail as Mock).mockResolvedValue(undefined);

      const result = await createNotification(
        "user123",
        "SYSTEM",
        "Test",
        "Desc",
        "Actor",
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: "user123",
          type: "SYSTEM",
          title: "Test",
          description: "Desc",
          actorName: "Actor",
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
      expect(result).toEqual(mockNotification);
    });

    it("should handle email sending errors gracefully", async () => {
      const mockNotification = {
        id: "notif1",
        userId: "user123",
        user: {
          email: "test@test.com",
          name: "Test User",
          emailNotifications: true,
        },
      };

      (prisma.notification.create as Mock).mockResolvedValue(mockNotification);
      (sendNotificationEmail as Mock).mockRejectedValue(
        new Error("Email error"),
      );

      const result = await createNotification(
        "user123",
        "EXPIRED",
        "Test",
        "Desc",
        "Actor",
      );

      expect(result).toEqual(mockNotification);
    });

    it("should throw error if database creation fails", async () => {
      (prisma.notification.create as Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      await expect(
        createNotification("user123", "SYSTEM", "Test", "Desc", "Actor"),
      ).rejects.toThrow("DB Error");
    });

    it("should create notification with SHARED type", async () => {
      const mockNotification = {
        id: "notif1",
        userId: "user123",
        type: "SHARED",
        user: {
          email: "test@test.com",
          name: "Test User",
          emailNotifications: false,
        },
      };

      (prisma.notification.create as Mock).mockResolvedValue(mockNotification);

      const result = await createNotification(
        "user123",
        "SHARED",
        "You were mentioned",
        "In task XYZ",
        "John Doe",
      );

      expect(result.type).toBe("SHARED");
    });

    it("should create notification with EXPIRED type", async () => {
      const mockNotification = {
        id: "notif1",
        userId: "user123",
        type: "EXPIRED",
        user: {
          email: "test@test.com",
          name: "Test User",
          emailNotifications: false,
        },
      };

      (prisma.notification.create as Mock).mockResolvedValue(mockNotification);

      const result = await createNotification(
        "user123",
        "EXPIRED",
        "File uploaded",
        "New file added",
        "Jane Doe",
      );

      expect(result.type).toBe("EXPIRED");
    });

    it("should create notification with empty description", async () => {
      const mockNotification = {
        id: "notif1",
        userId: "user123",
        user: {
          email: "test@test.com",
          name: "Test User",
          emailNotifications: false,
        },
      };

      (prisma.notification.create as Mock).mockResolvedValue(mockNotification);

      await createNotification("user123", "SYSTEM", "Title", "", "Actor");

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: "",
          }),
        }),
      );
    });

    it("should create notification with very long content", async () => {
      const longTitle = "A".repeat(500);
      const longDesc = "B".repeat(1000);
      const mockNotification = {
        id: "notif1",
        userId: "user123",
        user: {
          email: "test@test.com",
          name: "Test User",
          emailNotifications: false,
        },
      };

      (prisma.notification.create as Mock).mockResolvedValue(mockNotification);

      await createNotification(
        "user123",
        "SYSTEM",
        longTitle,
        longDesc,
        "Actor",
      );

      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it("should create notification with special characters", async () => {
      const specialTitle = "<script>alert('XSS')</script>";
      const specialDesc = "Test & 'quotes' \"double\" <tags>";
      const mockNotification = {
        id: "notif1",
        userId: "user123",
        user: {
          email: "test@test.com",
          name: "Test User",
          emailNotifications: false,
        },
      };

      (prisma.notification.create as Mock).mockResolvedValue(mockNotification);

      await createNotification(
        "user123",
        "SYSTEM",
        specialTitle,
        specialDesc,
        "Actor<>",
      );

      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });
});
