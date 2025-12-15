import { SharePermission } from "@prisma/client";
import { Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import {
  createList,
  deleteList,
  getSharedLists,
  getUserLists,
  shareList,
  unshareList,
  updateList,
  updateSharePermission,
} from "../../src/controllers/listsController";
import * as notificationsController from "../../src/controllers/notificationsController";
import prisma from "../../src/database/prisma";

interface RequestWithUser {
  user?: { id: string; email: string; name: string };
  params: Record<string, string>;
  body: Record<string, unknown>;
}

vi.mock("../../src/database/prisma", () => ({
  default: {
    list: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    listShare: {
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

describe("ListsController", () => {
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

  describe("createList", () => {
    it("should create a new list", async () => {
      mockReq.body = { name: "My List", description: "Test description" };

      const mockList = {
        id: "list1",
        name: "My List",
        description: "Test description",
        ownerId: "user123",
        shares: [],
        tasks: [],
      };

      (prisma.list.create as Mock).mockResolvedValue(mockList);

      await createList(mockReq as never, mockRes as Response);

      expect(prisma.list.create).toHaveBeenCalledWith({
        data: {
          name: "My List",
          description: "Test description",
          ownerId: "user123",
        },
        include: expect.objectContaining({
          shares: expect.any(Object),
          tasks: true,
        }),
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockList);
    });

    it("should return 401 if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.body = { name: "My List" };

      await createList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "User not authenticated",
      });
    });

    it("should handle database errors", async () => {
      mockReq.body = { name: "My List" };
      (prisma.list.create as Mock).mockRejectedValue(new Error("DB Error"));

      await createList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error creating list" });
    });

    it("should create list with empty description", async () => {
      mockReq.body = { name: "My List", description: "" };
      const mockList = {
        id: "list1",
        name: "My List",
        description: "",
        ownerId: "user123",
        shares: [],
        tasks: [],
      };

      (prisma.list.create as Mock).mockResolvedValue(mockList);

      await createList(mockReq as never, mockRes as Response);

      expect(prisma.list.create).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockList);
    });

    it("should create list with very long name", async () => {
      const longName = "A".repeat(500);
      mockReq.body = { name: longName, description: "Test" };
      const mockList = {
        id: "list1",
        name: longName,
        description: "Test",
        ownerId: "user123",
        shares: [],
        tasks: [],
      };

      (prisma.list.create as Mock).mockResolvedValue(mockList);

      await createList(mockReq as never, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockList);
    });
  });

  describe("deleteList", () => {
    it("should delete list as owner", async () => {
      mockReq.params = { id: "list1" };

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.list.delete as Mock).mockResolvedValue(mockList);

      await deleteList(mockReq as never, mockRes as Response);

      expect(prisma.list.delete).toHaveBeenCalledWith({
        where: { id: "list1" },
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockList);
    });

    it("should delete list as admin", async () => {
      mockReq.params = { id: "list1" };

      const mockList = {
        id: "list1",
        ownerId: "other123",
        shares: [{ userId: "user123", permission: SharePermission.ADMIN }],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.list.delete as Mock).mockResolvedValue(mockList);

      await deleteList(mockReq as never, mockRes as Response);

      expect(prisma.list.delete).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 401 if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "list1" };

      await deleteList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "User not authenticated",
      });
    });

    it("should return 404 if list not found", async () => {
      mockReq.params = { id: "nonexistent" };
      (prisma.list.findUnique as Mock).mockResolvedValue(null);

      await deleteList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "List not found" });
    });

    it("should return 403 if user lacks permission", async () => {
      mockReq.params = { id: "list1" };

      const mockList = {
        id: "list1",
        ownerId: "other123",
        shares: [{ userId: "user123", permission: SharePermission.VIEW }],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);

      await deleteList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "list1" };
      (prisma.list.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await deleteList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error deleting list" });
    });
  });

  describe("getUserLists", () => {
    it("should return user's owned lists", async () => {
      const mockLists = [
        {
          id: "list1",
          name: "List 1",
          ownerId: "user123",
          shares: [],
          tasks: [],
        },
      ];

      (prisma.list.findMany as Mock).mockResolvedValue(mockLists);

      await getUserLists(mockReq as never, mockRes as Response);

      expect(prisma.list.findMany).toHaveBeenCalledWith({
        where: { ownerId: "user123" },
        include: expect.objectContaining({
          shares: expect.any(Object),
          tasks: true,
        }),
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockLists);
    });

    it("should return empty array if user has no lists", async () => {
      (prisma.list.findMany as Mock).mockResolvedValue([]);

      await getUserLists(mockReq as never, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith([]);
    });

    it("should handle database errors", async () => {
      (prisma.list.findMany as Mock).mockRejectedValue(new Error("DB Error"));

      await getUserLists(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error getting lists" });
    });
  });

  describe("getSharedLists", () => {
    it("should return lists shared with user", async () => {
      const mockLists = [
        {
          id: "list1",
          name: "Shared List",
          ownerId: "other123",
          shares: [{ userId: "user123", permission: SharePermission.VIEW }],
          tasks: [],
          owner: {
            id: "other123",
            name: "Other User",
            email: "other@test.com",
          },
        },
      ];

      (prisma.list.findMany as Mock).mockResolvedValue(mockLists);

      await getSharedLists(mockReq as never, mockRes as Response);

      expect(prisma.list.findMany).toHaveBeenCalledWith({
        where: {
          shares: {
            some: {
              userId: "user123",
            },
          },
        },
        include: expect.objectContaining({
          shares: expect.any(Object),
          tasks: true,
          owner: expect.any(Object),
        }),
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockLists);
    });

    it("should handle database errors", async () => {
      (prisma.list.findMany as Mock).mockRejectedValue(new Error("DB Error"));

      await getSharedLists(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error getting shared lists",
      });
    });
  });

  describe("updateList", () => {
    it("should update list as owner", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { name: "Updated Name", description: "Updated Desc" };

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      const updatedList = { ...mockList, name: "Updated Name" };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.list.update as Mock).mockResolvedValue(updatedList);

      await updateList(mockReq as never, mockRes as Response);

      expect(prisma.list.update).toHaveBeenCalledWith({
        where: { id: "list1" },
        data: { name: "Updated Name", description: "Updated Desc" },
        include: expect.objectContaining({
          shares: expect.any(Object),
          tasks: true,
        }),
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updatedList);
    });

    it("should update list with EDIT permission", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { name: "Updated Name" };

      const mockList = {
        id: "list1",
        ownerId: "other123",
        shares: [{ userId: "user123", permission: SharePermission.EDIT }],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.list.update as Mock).mockResolvedValue(mockList);

      await updateList(mockReq as never, mockRes as Response);

      expect(prisma.list.update).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 401 if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "list1" };

      await updateList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("should return 404 if list not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockReq.body = { name: "Updated" };
      (prisma.list.findUnique as Mock).mockResolvedValue(null);

      await updateList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 403 if user lacks permission", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { name: "Updated" };

      const mockList = {
        id: "list1",
        ownerId: "other123",
        shares: [{ userId: "user123", permission: SharePermission.VIEW }],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);

      await updateList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it("should return 400 if no fields to update", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = {};

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);

      await updateList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "No fields to update" });
    });

    it("should update only name if description not provided", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { name: "Only Name" };

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.list.update as Mock).mockResolvedValue(mockList);

      await updateList(mockReq as never, mockRes as Response);

      expect(prisma.list.update).toHaveBeenCalledWith({
        where: { id: "list1" },
        data: { name: "Only Name" },
        include: expect.objectContaining({
          shares: expect.any(Object),
          tasks: true,
        }),
      });
    });

    it("should return 403 if user has no share record for the list", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { name: "Updated" };

      const mockList = {
        id: "list1",
        ownerId: "other123",
        shares: [],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);

      await updateList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { name: "Updated" };
      (prisma.list.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await updateList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe("shareList", () => {
    it("should share list with another user", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { email: "other@test.com", permission: "EDIT" };

      const mockList = {
        id: "list1",
        name: "My List",
        ownerId: "user123",
        shares: [],
      };

      const mockOtherUser = {
        id: "other123",
        email: "other@test.com",
        name: "Other User",
      };

      const mockCurrentUser = {
        id: "user123",
        name: "Test User",
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.user.findUnique as Mock)
        .mockResolvedValueOnce(mockOtherUser)
        .mockResolvedValueOnce(mockCurrentUser);
      (prisma.listShare.findUnique as Mock).mockResolvedValue(null);
      (prisma.list.update as Mock).mockResolvedValue({
        ...mockList,
        shares: [{ userId: "other123", permission: "EDIT" }],
      });

      await shareList(mockReq as never, mockRes as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "other@test.com" },
      });
      expect(prisma.list.update).toHaveBeenCalled();
      expect(notificationsController.createNotification).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 401 if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "list1" };

      await shareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("should return 404 if list not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockReq.body = { email: "other@test.com" };
      (prisma.list.findUnique as Mock).mockResolvedValue(null);

      await shareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "List not found" });
    });

    it("should return 403 if user lacks permission", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { email: "other@test.com" };

      const mockList = {
        id: "list1",
        ownerId: "other123",
        shares: [{ userId: "user123", permission: SharePermission.EDIT }],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);

      await shareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it("should return 404 if user to share with not found", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { email: "nonexistent@test.com" };

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.user.findUnique as Mock).mockResolvedValue(null);

      await shareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should return 400 if trying to share with yourself", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { email: "test@test.com" };

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      const mockSameUser = {
        id: "user123",
        email: "test@test.com",
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.user.findUnique as Mock).mockResolvedValue(mockSameUser);

      await shareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Cannot share list with yourself",
      });
    });

    it("should return 400 if list already shared with user", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { email: "other@test.com" };

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      const mockOtherUser = {
        id: "other123",
        email: "other@test.com",
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.user.findUnique as Mock).mockResolvedValue(mockOtherUser);
      (prisma.listShare.findUnique as Mock).mockResolvedValue({
        listId: "list1",
        userId: "other123",
      });

      await shareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "List already shared with this user",
      });
    });

    it("should use VIEW permission as default", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { email: "other@test.com" };

      const mockList = {
        id: "list1",
        name: "My List",
        ownerId: "user123",
        shares: [],
      };

      const mockOtherUser = {
        id: "other123",
        email: "other@test.com",
      };

      const mockCurrentUser = {
        id: "user123",
        name: "Test User",
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.user.findUnique as Mock)
        .mockResolvedValueOnce(mockOtherUser)
        .mockResolvedValueOnce(mockCurrentUser);
      (prisma.listShare.findUnique as Mock).mockResolvedValue(null);
      (prisma.list.update as Mock).mockResolvedValue(mockList);

      await shareList(mockReq as never, mockRes as Response);

      expect(prisma.list.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            shares: {
              create: {
                userId: "other123",
                permission: "VIEW",
              },
            },
          },
        }),
      );
    });

    it("should use fallback name if user name is missing", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { email: "other@test.com", permission: "EDIT" };

      const mockList = {
        id: "list1",
        name: "My List",
        ownerId: "user123",
        shares: [],
      };

      const mockOtherUser = {
        id: "other123",
        email: "other@test.com",
        name: "Other User",
      };

      const mockCurrentUser = {
        id: "user123",
        name: null,
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.user.findUnique as Mock)
        .mockResolvedValueOnce(mockOtherUser)
        .mockResolvedValueOnce(mockCurrentUser);
      (prisma.listShare.findUnique as Mock).mockResolvedValue(null);
      (prisma.list.update as Mock).mockResolvedValue({
        ...mockList,
        shares: [{ userId: "other123", permission: "EDIT" }],
      });

      await shareList(mockReq as never, mockRes as Response);

      expect(notificationsController.createNotification).toHaveBeenCalledWith(
        "other123",
        "SHARED",
        "Nueva lista compartida",
        expect.stringContaining("Alguien"),
        "Usuario",
      );
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "list1" };
      mockReq.body = { email: "other@test.com" };
      (prisma.list.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await shareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe("unshareList", () => {
    it("should unshare list from user", async () => {
      mockReq.params = { id: "list1", userId: "other123" };

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.list.update as Mock).mockResolvedValue(mockList);

      await unshareList(mockReq as never, mockRes as Response);

      expect(prisma.list.update).toHaveBeenCalledWith({
        where: { id: "list1" },
        data: {
          shares: {
            delete: {
              listId_userId: {
                listId: "list1",
                userId: "other123",
              },
            },
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
          tasks: true,
        },
      });
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 401 if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "list1", userId: "other123" };

      await unshareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("should return 404 if list not found", async () => {
      mockReq.params = { id: "nonexistent", userId: "other123" };
      (prisma.list.findUnique as Mock).mockResolvedValue(null);

      await unshareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 403 if user lacks permission", async () => {
      mockReq.params = { id: "list1", userId: "other123" };

      const mockList = {
        id: "list1",
        ownerId: "other456",
        shares: [{ userId: "user123", permission: SharePermission.EDIT }],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);

      await unshareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "list1", userId: "other123" };
      (prisma.list.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await unshareList(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });

    it("should allow user to unshare themselves (leave list)", async () => {
      mockReq.params = { id: "list1", userId: "user123" };

      const mockList = {
        id: "list1",
        ownerId: "owner456",
        shares: [
          {
            userId: "user123",
            permission: SharePermission.VIEW,
          },
        ],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.list.update as Mock).mockResolvedValue(mockList);

      await unshareList(mockReq as never, mockRes as Response);

      expect(prisma.list.update).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe("updateSharePermission", () => {
    it("should update share permission", async () => {
      mockReq.params = { id: "list1", userId: "other123" };
      mockReq.body = { permission: "ADMIN" };

      const mockList = {
        id: "list1",
        ownerId: "user123",
        shares: [],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);
      (prisma.list.update as Mock).mockResolvedValue(mockList);

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(prisma.list.update).toHaveBeenCalledWith({
        where: { id: "list1" },
        data: {
          shares: {
            update: {
              where: {
                listId_userId: {
                  listId: "list1",
                  userId: "other123",
                },
              },
              data: {
                permission: "ADMIN",
              },
            },
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
          tasks: true,
        },
      });
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return 401 if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "list1", userId: "other123" };

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("should return 404 if list not found", async () => {
      mockReq.params = { id: "nonexistent", userId: "other123" };
      mockReq.body = { permission: "EDIT" };
      (prisma.list.findUnique as Mock).mockResolvedValue(null);

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return 403 if user lacks permission", async () => {
      mockReq.params = { id: "list1", userId: "other123" };
      mockReq.body = { permission: "EDIT" };

      const mockList = {
        id: "list1",
        ownerId: "other456",
        shares: [{ userId: "user123", permission: SharePermission.VIEW }],
      };

      (prisma.list.findUnique as Mock).mockResolvedValue(mockList);

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it("should handle database errors", async () => {
      mockReq.params = { id: "list1", userId: "other123" };
      mockReq.body = { permission: "EDIT" };
      (prisma.list.findUnique as Mock).mockRejectedValue(new Error("DB Error"));

      await updateSharePermission(mockReq as never, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});
