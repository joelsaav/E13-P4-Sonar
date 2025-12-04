import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { getSharedTasks } from "../src/controllers/tasksController";
import { getSharedLists } from "../src/controllers/listsController";
import prisma from "../src/database/prisma";

vi.mock("../src/database/prisma", () => ({
  default: {
    task: {
      findMany: vi.fn(),
    },
    list: {
      findMany: vi.fn(),
    },
  },
}));

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

describe("Shared Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      user: { id: "user-123" },
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("getSharedTasks", () => {
    it("should fetch shared tasks successfully", async () => {
      const mockTasks = [
        { id: "task-1", name: "Shared Task 1" },
        { id: "task-2", name: "Shared Task 2" },
      ];
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks as any);

      await getSharedTasks(mockRequest as Request, mockResponse as Response);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                shares: { some: { userId: "user-123" } },
              }),
              expect.objectContaining({
                list: { shares: { some: { userId: "user-123" } } },
              }),
            ]),
          }),
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTasks);
    });
  });

  describe("getSharedLists", () => {
    it("should fetch shared lists successfully", async () => {
      const mockLists = [{ id: "list-1", name: "Shared List 1" }];
      vi.mocked(prisma.list.findMany).mockResolvedValue(mockLists as any);

      await getSharedLists(mockRequest as Request, mockResponse as Response);

      expect(prisma.list.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            shares: { some: { userId: "user-123" } },
          }),
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockLists);
    });
  });
});
