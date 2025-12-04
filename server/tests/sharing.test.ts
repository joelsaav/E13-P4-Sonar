import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { shareTask } from "../src/controllers/tasksController";
import { shareList } from "../src/controllers/listsController";
import prisma from "../src/database/prisma";
import * as notificationsController from "../src/controllers/notificationsController";

// Mock prisma
vi.mock("../src/database/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    task: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    list: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    listShare: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock createNotification
vi.mock("../src/controllers/notificationsController", () => ({
  createNotification: vi.fn(),
}));

describe("Sharing Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      user: { id: "user-123" },
      body: {},
      params: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("shareTask", () => {
    it("should share task and create notification", async () => {
      mockRequest.params = { id: "task-1" };
      mockRequest.body = { email: "friend@example.com", permission: "VIEW" };

      // Mock finding the user to share with
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: "friend-123",
          email: "friend@example.com",
        } as any) // User to share with
        .mockResolvedValueOnce({ id: "user-123", name: "Owner Name" } as any); // Current user

      // Mock finding the task
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: "task-1",
        userId: "user-123",
        listId: "list-1",
      } as any);

      // Mock updating the task
      vi.mocked(prisma.task.update).mockResolvedValue({
        id: "task-1",
        name: "My Task",
      } as any);

      await shareTask(mockRequest as Request, mockResponse as Response);

      expect(prisma.task.update).toHaveBeenCalled();
      expect(notificationsController.createNotification).toHaveBeenCalledWith(
        "friend-123",
        "GENERAL",
        "Nueva tarea compartida",
        'Owner Name te ha compartido la tarea "My Task"',
        "Owner Name",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe("shareList", () => {
    it("should share list and create notification", async () => {
      mockRequest.params = { id: "list-1" };
      mockRequest.body = { email: "friend@example.com", permission: "VIEW" };

      // Mock finding the user to share with
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: "friend-123",
          email: "friend@example.com",
        } as any) // User to share with
        .mockResolvedValueOnce({ id: "user-123", name: "Owner Name" } as any); // Current user

      // Mock finding the list
      vi.mocked(prisma.list.findUnique).mockResolvedValue({
        id: "list-1",
        ownerId: "user-123",
      } as any);

      // Mock updating the list
      vi.mocked(prisma.list.update).mockResolvedValue({
        id: "list-1",
        name: "My List",
      } as any);

      await shareList(mockRequest as Request, mockResponse as Response);

      expect(prisma.list.update).toHaveBeenCalled();
      expect(notificationsController.createNotification).toHaveBeenCalledWith(
        "friend-123",
        "GENERAL",
        "Nueva lista compartida",
        'Owner Name te ha compartido la lista "My List"',
        "Owner Name",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
