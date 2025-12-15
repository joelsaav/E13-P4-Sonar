import { SharePermission } from "@prisma/client";
import { Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import * as notificationsController from "../../src/controllers/notificationsController";
import {
  createTask,
  deleteTask,
  getSharedTasks,
  getUserTasks,
  shareTask,
  unshareTask,
  updateSharePermission,
  updateTask,
} from "../../src/controllers/tasksController";
import prisma from "../../src/database/prisma";

interface RequestWithUser {
  user?: { id: string; email: string; name: string };
  params: Record<string, string>;
  body: Record<string, unknown>;
}

vi.mock("../../src/database/prisma", () => ({
  default: {
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    list: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    taskShare: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../../src/controllers/notificationsController", () => ({
  createNotification: vi.fn(),
}));

vi.mock("../../src/utils/socket", () => ({
  getIO: vi.fn().mockReturnValue({
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  }),
}));

describe("TasksController", () => {
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

  describe("createTask", () => {
    it("should create task when user is list owner", async () => {
      mockReq.body = {
        name: "New Task",
        description: "Task description",
        status: "TODO",
        listId: "list1",
        priority: "HIGH",
        dueDate: "2025-12-31",
      };

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      const mockTask = {
        id: "task1",
        name: "New Task",
        description: "Task description",
        status: "TODO",
        listId: "list1",
        priority: "HIGH",
        dueDate: "2025-12-31",
        shares: [],
        list: mockList,
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.task.create as Mock).mockResolvedValue(mockTask);

      await createTask(mockReq as never, mockRes as Response);

      expect(prisma.task.create).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockTask);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.body = { name: "Task", listId: "list1" };

      await createTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 404 if list not found", async () => {
      mockReq.body = { name: "Task", listId: "nonexistent" };
      (prisma.list.findUnique as Mock).mockResolvedValue(null);

      await createTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "List not found" });
    });

    it("should create task when user has EDIT permission", async () => {
      mockReq.body = { name: "Task", listId: "list1" };

      const mockList = {
        id: "list1",
        ownerId: "owner456",
        shares: [{ userId: "user123", permission: SharePermission.EDIT }],
      };

      const mockTask = {
        id: "task1",
        name: "Task",
        shares: [],
        list: mockList,
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.task.create as Mock).mockResolvedValue(mockTask);

      await createTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockTask);
    });

    it("should return 403 if user has no permission", async () => {
      mockReq.body = { name: "Task", listId: "list1" };

      const mockList = {
        id: "list1",
        ownerId: "owner456",
        shares: [],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);

      await createTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should handle database errors", async () => {
      mockReq.body = { name: "Task", listId: "list1" };
      (prisma.list.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await createTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error creating task" });
    });
  });

  describe("deleteTask", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "task1" };

      await deleteTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 404 if task not found", async () => {
      mockReq.params = { id: "nonexistent" };
      (prisma.task.findUnique as Mock).mockResolvedValue(null);

      await deleteTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Task not found" });
    });

    it("should return 404 if list not found", async () => {
      mockReq.params = { id: "task1" };

      const mockTask = {
        id: "task1",
        list: null,
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await deleteTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "List not found" });
    });

    it("should delete task when user has ADMIN permission via list share", async () => {
      mockReq.params = { id: "task1" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "owner456",
          shares: [{ userId: "user123", permission: SharePermission.ADMIN }],
        },
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.task.delete as Mock).mockResolvedValue(mockTask);

      await deleteTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 403 if user only has EDIT permission", async () => {
      mockReq.params = { id: "task1" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "owner456",
          shares: [{ userId: "user123", permission: SharePermission.EDIT }],
        },
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await deleteTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "task1" };
      (prisma.task.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await deleteTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error deleting task" });
    });
  });

  describe("getUserTasks", () => {
    it("should return all user tasks", async () => {
      const mockTasks = [
        {
          id: "task1",
          name: "Task 1",
          list: { id: "list1", ownerId: "user123" },
          shares: [],
        },
        {
          id: "task2",
          name: "Task 2",
          list: { id: "list2", ownerId: "user123" },
          shares: [],
        },
      ];

      (prisma.task.findMany as Mock).mockResolvedValue(mockTasks);

      await getUserTasks(mockReq as never, mockRes as Response);

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          list: {
            ownerId: "user123",
          },
        },
        include: {
          shares: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          list: true,
        },
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockTasks);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;

      await getUserTasks(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should handle database errors", async () => {
      (prisma.task.findMany as Mock).mockRejectedValue(new Error("DB Error"));

      await getUserTasks(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error getting tasks" });
    });
  });

  describe("getSharedTasks", () => {
    it("should return all shared tasks", async () => {
      const mockTasks = [
        {
          id: "task1",
          name: "Shared Task 1",
          shares: [{ userId: "user123", permission: SharePermission.VIEW }],
          list: {
            owner: {
              id: "owner456",
              name: "Owner",
              email: "owner@test.com",
              image: null,
            },
          },
        },
      ];

      (prisma.task.findMany as Mock).mockResolvedValue(mockTasks);

      await getSharedTasks(mockReq as never, mockRes as Response);

      expect(prisma.task.findMany).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockTasks);
    });

    it("should handle database errors", async () => {
      (prisma.task.findMany as Mock).mockRejectedValue(new Error("DB Error"));

      await getSharedTasks(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error getting shared tasks",
      });
    });
  });

  describe("updateTask", () => {
    it("should update task when user is owner", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = {
        name: "Updated Task",
        description: "Updated description",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
      };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      const updatedTask = {
        ...mockTask,
        name: "Updated Task",
        description: "Updated description",
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.task.update as Mock).mockResolvedValue(updatedTask);

      await updateTask(mockReq as never, mockRes as Response);

      expect(prisma.task.update).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updatedTask);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "task1" };

      await updateTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 404 if task not found", async () => {
      mockReq.params = { id: "nonexistent" };
      (prisma.task.findUnique as Mock).mockResolvedValue(null);

      await updateTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Task not found" });
    });

    it("should return 404 if list not found", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { name: "Updated" };

      const mockTask = {
        id: "task1",
        list: null,
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await updateTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "List not found" });
    });

    it("should return 400 if no fields to update", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = {};

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await updateTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "No fields to update" });
    });

    it("should update all task fields", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = {
        name: "New Name",
        description: "New Description",
        status: "DONE",
        listId: "list2",
        priority: "LOW",
        dueDate: "2025-12-31",
        favorite: true,
      };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      const updatedTask = { ...mockTask, ...mockReq.body };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.task.update as Mock).mockResolvedValue(updatedTask);

      await updateTask(mockReq as never, mockRes as Response);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "task1" },
        data: {
          name: "New Name",
          description: "New Description",
          status: "DONE",
          listId: "list2",
          priority: "LOW",
          dueDate: "2025-12-31",
          favorite: true,
        },
        include: expect.any(Object),
      });
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should update task when user has direct TASK permission (even if no list permission)", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { name: "Updated via Task Share" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "owner456",
          shares: [],
        },
        shares: [
          {
            userId: "user123",
            permission: SharePermission.EDIT,
          },
        ],
      };

      const updatedTask = { ...mockTask, name: "Updated via Task Share" };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.task.update as Mock).mockResolvedValue(updatedTask);

      await updateTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updatedTask);
    });

    it("should return 403 if user has direct TASK permission but insufficient level", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { name: "Updated" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "owner456",
          shares: [],
        },
        shares: [
          {
            userId: "user123",
            permission: SharePermission.VIEW,
          },
        ],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await updateTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { name: "Updated" };
      (prisma.task.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await updateTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error updating task" });
    });
  });

  describe("shareTask", () => {
    it("should share task when user is owner", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = {
        email: "share@test.com",
        permission: SharePermission.EDIT,
      };

      const mockTask = {
        id: "task1",
        name: "Task",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      const mockUserToShare = {
        id: "user456",
        email: "share@test.com",
        name: "Share User",
      };

      const mockCurrentUser = {
        id: "user123",
        name: "Test User",
      };

      const updatedTask = {
        ...mockTask,
        shares: [{ userId: "user456", permission: SharePermission.EDIT }],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.user.findUnique as Mock)
        .mockResolvedValueOnce(mockUserToShare)
        .mockResolvedValueOnce(mockCurrentUser);
      (prisma.task.update as Mock).mockResolvedValue(updatedTask);
      (notificationsController.createNotification as Mock).mockResolvedValue(
        {},
      );

      await shareTask(mockReq as never, mockRes as Response);

      expect(prisma.task.update).toHaveBeenCalled();
      expect(notificationsController.createNotification).toHaveBeenCalledWith(
        "user456",
        "SHARED",
        "Nueva tarea compartida",
        expect.stringContaining("Test User"),
        "Test User",
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updatedTask);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "task1" };

      await shareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 404 if task not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockReq.body = { email: "share@test.com" };
      (prisma.task.findUnique as Mock).mockResolvedValue(null);

      await shareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Task not found" });
    });

    it("should return 404 if list not found", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { email: "share@test.com" };

      const mockTask = {
        id: "task1",
        list: null,
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await shareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "List not found" });
    });

    it("should return 403 if user does not have ADMIN permission", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { email: "share@test.com" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "owner456",
          shares: [{ userId: "user123", permission: SharePermission.EDIT }],
        },
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await shareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 404 if user to share not found", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { email: "nonexistent@test.com" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.user.findUnique as Mock).mockResolvedValue(null);

      await shareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should return 400 if trying to share with yourself", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { email: "test@test.com" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      const mockUserToShare = {
        id: "user123",
        email: "test@test.com",
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.user.findUnique as Mock).mockResolvedValue(mockUserToShare);

      await shareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Cannot share task with yourself",
      });
    });

    it("should default to VIEW permission if not specified", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { email: "share@test.com" };

      const mockTask = {
        id: "task1",
        name: "Task",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      const mockUserToShare = {
        id: "user456",
        email: "share@test.com",
      };

      const mockCurrentUser = { id: "user123", name: "Test User" };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.user.findUnique as Mock)
        .mockResolvedValueOnce(mockUserToShare)
        .mockResolvedValueOnce(mockCurrentUser);
      (prisma.task.update as Mock).mockResolvedValue(mockTask);
      (notificationsController.createNotification as Mock).mockResolvedValue(
        {},
      );

      await shareTask(mockReq as never, mockRes as Response);

      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            shares: {
              create: {
                userId: "user456",
                permission: SharePermission.VIEW,
              },
            },
          },
        }),
      );
    });

    it("should use fallback name if user name is missing", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = {
        email: "share@test.com",
        permission: SharePermission.EDIT,
      };

      const mockTask = {
        id: "task1",
        name: "Task",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      const mockUserToShare = {
        id: "user456",
        email: "share@test.com",
        name: "Share User",
      };

      const mockCurrentUser = {
        id: "user123",
        name: null,
      };

      const updatedTask = {
        ...mockTask,
        shares: [{ userId: "user456", permission: SharePermission.EDIT }],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      (prisma.user.findUnique as Mock)
        .mockResolvedValueOnce(mockUserToShare)
        .mockResolvedValueOnce(mockCurrentUser);

      (prisma.task.update as Mock).mockResolvedValue(updatedTask);
      (notificationsController.createNotification as Mock).mockResolvedValue(
        {},
      );

      await shareTask(mockReq as never, mockRes as Response);

      expect(notificationsController.createNotification).toHaveBeenCalledWith(
        "user456",
        "SHARED",
        "Nueva tarea compartida",
        expect.stringContaining("Alguien"),
        "Usuario",
      );
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "task1" };
      mockReq.body = { email: "share@test.com" };
      (prisma.task.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await shareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error sharing task" });
    });
  });

  describe("updateSharePermission", () => {
    it("should update share permission when user is owner", async () => {
      mockReq.params = { id: "task1", userId: "user456" };
      mockReq.body = { permission: SharePermission.ADMIN };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      const mockShare = {
        taskId: "task1",
        userId: "user456",
        permission: SharePermission.VIEW,
      };

      const updatedTask = {
        ...mockTask,
        shares: [{ userId: "user456", permission: SharePermission.ADMIN }],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.taskShare.findUnique as Mock).mockResolvedValue(mockShare);
      (prisma.task.update as Mock).mockResolvedValue(updatedTask);

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(prisma.task.update).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updatedTask);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "task1", userId: "user456" };

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 404 if task not found", async () => {
      mockReq.params = { id: "nonexistent", userId: "user456" };
      (prisma.task.findUnique as Mock).mockResolvedValue(null);

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Task not found" });
    });

    it("should return 404 if list not found", async () => {
      mockReq.params = { id: "task1", userId: "user456" };

      const mockTask = {
        id: "task1",
        list: null,
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "List not found" });
    });

    it("should return 403 if user does not have ADMIN permission", async () => {
      mockReq.params = { id: "task1", userId: "user456" };
      mockReq.body = { permission: SharePermission.EDIT };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "owner999",
          shares: [{ userId: "user123", permission: SharePermission.EDIT }],
        },
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 404 if share not found", async () => {
      mockReq.params = { id: "task1", userId: "user456" };
      mockReq.body = { permission: SharePermission.EDIT };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.taskShare.findUnique as Mock).mockResolvedValue(null);

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Share not found" });
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "task1", userId: "user456" };
      (prisma.task.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error updating share permission",
      });
    });
  });

  describe("unshareTask", () => {
    it("should unshare task when user is owner", async () => {
      mockReq.params = { id: "task1", userId: "user456" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      const mockShare = {
        taskId: "task1",
        userId: "user456",
        permission: SharePermission.VIEW,
      };

      const updatedTask = { ...mockTask, shares: [] };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.taskShare.findUnique as Mock).mockResolvedValue(mockShare);
      (prisma.task.update as Mock).mockResolvedValue(updatedTask);

      await unshareTask(mockReq as never, mockRes as Response);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "task1" },
        data: {
          shares: {
            delete: {
              taskId_userId: {
                taskId: "task1",
                userId: "user456",
              },
            },
          },
        },
        include: expect.any(Object),
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updatedTask);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "task1", userId: "user456" };

      await unshareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should allow user to unshare themselves", async () => {
      mockReq.params = { id: "task1", userId: "user123" };

      const mockShare = {
        taskId: "task1",
        userId: "user123",
        permission: SharePermission.VIEW,
      };

      const mockTask = {
        id: "task1",
        shares: [],
        list: { id: "list1", ownerId: "owner456" },
      };

      (prisma.taskShare.findUnique as Mock).mockResolvedValue(mockShare);
      (prisma.task.update as Mock).mockResolvedValue(mockTask);

      await unshareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 404 if task not found when unsharing others", async () => {
      mockReq.params = { id: "nonexistent", userId: "user456" };
      (prisma.task.findUnique as Mock).mockResolvedValue(null);

      await unshareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Task not found" });
    });

    it("should return 404 if list not found when unsharing others", async () => {
      mockReq.params = { id: "task1", userId: "user456" };

      const mockTask = {
        id: "task1",
        list: null,
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await unshareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "List not found" });
    });

    it("should return 403 if user does not have ADMIN permission", async () => {
      mockReq.params = { id: "task1", userId: "user456" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "owner999",
          shares: [{ userId: "user123", permission: SharePermission.EDIT }],
        },
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);

      await unshareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 404 if share not found", async () => {
      mockReq.params = { id: "task1", userId: "user456" };

      const mockTask = {
        id: "task1",
        list: {
          id: "list1",
          ownerId: "user123",
          shares: [],
        },
        shares: [],
      };

      (prisma.task.findUnique as Mock).mockResolvedValue(mockTask);
      (prisma.taskShare.findUnique as Mock).mockResolvedValue(null);

      await unshareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Share not found" });
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "task1", userId: "user456" };
      (prisma.taskShare.findUnique as Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      await unshareTask(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error unsharing task" });
    });
  });
});
