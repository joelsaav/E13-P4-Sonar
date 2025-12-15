import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "../../src/database/prisma";
import {
  cleanupOldCompletedTasks,
  startCleanupJob,
} from "../../src/utils/cleanupTasks";

vi.mock("../../src/database/prisma", () => ({
  default: {
    task: {
      deleteMany: vi.fn(),
    },
  },
}));

describe("cleanupOldCompletedTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 0 when deletion fails", async () => {
    const mockDeleteMany = vi.mocked(prisma.task.deleteMany);
    mockDeleteMany.mockRejectedValue(new Error("Database error"));
    const result = await cleanupOldCompletedTasks();
    expect(result).toBe(0);
  });
});

describe("startCleanupJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should setup interval to call cleanupOldCompletedTasks every hour", async () => {
    const mockDeleteMany = vi.mocked(prisma.task.deleteMany);
    mockDeleteMany.mockResolvedValue({ count: 0 });
    startCleanupJob();
    await vi.waitFor(() => {
      expect(mockDeleteMany).toHaveBeenCalledTimes(1);
    });
    vi.advanceTimersByTime(60 * 60 * 1000);
    await vi.waitFor(() => {
      expect(mockDeleteMany).toHaveBeenCalledTimes(2);
    });
    vi.advanceTimersByTime(60 * 60 * 1000);
    await vi.waitFor(() => {
      expect(mockDeleteMany).toHaveBeenCalledTimes(3);
    });
  });
});
