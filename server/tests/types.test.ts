import { describe, it, expect } from "vitest";
import { JwtPayload } from "../src/types/jwt";
import { TaskStatus, TaskPriority } from "../src/types/task";
import { SharePermission } from "../src/types/user";

describe("Type Definitions", () => {
  describe("JwtPayload", () => {
    it("should accept valid JwtPayload object", () => {
      const payload: JwtPayload = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      expect(payload).toHaveProperty("userId");
      expect(typeof payload.userId).toBe("string");
    });

    it("should enforce userId as string", () => {
      const payload: JwtPayload = {
        userId: "user-123",
      };

      expect(payload.userId).toBe("user-123");
    });
  });

  describe("TaskStatus Enum", () => {
    it("should have PENDING status", () => {
      expect(TaskStatus.PENDING).toBe("PENDING");
    });

    it("should have IN_PROGRESS status", () => {
      expect(TaskStatus.IN_PROGRESS).toBe("IN_PROGRESS");
    });

    it("should have COMPLETED status", () => {
      expect(TaskStatus.COMPLETED).toBe("COMPLETED");
    });

    it("should have exactly 3 values", () => {
      const values = Object.values(TaskStatus);
      expect(values).toHaveLength(3);
    });

    it("should contain all expected status values", () => {
      const values = Object.values(TaskStatus);
      expect(values).toContain("PENDING");
      expect(values).toContain("IN_PROGRESS");
      expect(values).toContain("COMPLETED");
    });

    it("should work in type checking", () => {
      const status: TaskStatus = TaskStatus.PENDING;
      expect(status).toBe(TaskStatus.PENDING);
    });
  });

  describe("Priority Enum", () => {
    it("should have LOW priority", () => {
      expect(TaskPriority.LOW).toBe("LOW");
    });

    it("should have MEDIUM priority", () => {
      expect(TaskPriority.MEDIUM).toBe("MEDIUM");
    });

    it("should have HIGH priority", () => {
      expect(TaskPriority.HIGH).toBe("HIGH");
    });

    it("should have URGENT priority", () => {
      expect(TaskPriority.URGENT).toBe("URGENT");
    });

    it("should have exactly 4 values", () => {
      const values = Object.values(TaskPriority);
      expect(values).toHaveLength(4);
    });

    it("should contain all expected priority values", () => {
      const values = Object.values(TaskPriority);
      expect(values).toContain("LOW");
      expect(values).toContain("MEDIUM");
      expect(values).toContain("HIGH");
      expect(values).toContain("URGENT");
    });

    it("should work in type checking", () => {
      const priority: TaskPriority = TaskPriority.HIGH;
      expect(priority).toBe(TaskPriority.HIGH);
    });
  });

  describe("SharePermission Enum", () => {
    it("should have VIEW permission", () => {
      expect(SharePermission.VIEW).toBe("VIEW");
    });

    it("should have EDIT permission", () => {
      expect(SharePermission.EDIT).toBe("EDIT");
    });

    it("should have ADMIN permission", () => {
      expect(SharePermission.ADMIN).toBe("ADMIN");
    });

    it("should have exactly 3 values", () => {
      const values = Object.values(SharePermission);
      expect(values).toHaveLength(3);
    });

    it("should contain all expected permission values", () => {
      const values = Object.values(SharePermission);
      expect(values).toContain("VIEW");
      expect(values).toContain("EDIT");
      expect(values).toContain("ADMIN");
    });

    it("should work in type checking", () => {
      const permission: SharePermission = SharePermission.ADMIN;
      expect(permission).toBe(SharePermission.ADMIN);
    });
  });

  describe("Type Integration", () => {
    it("should allow using enums together in a task object", () => {
      interface Task {
        status: TaskStatus;
        priority: TaskPriority;
      }

      const task: Task = {
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      };

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
      expect(task.priority).toBe(TaskPriority.HIGH);
    });

    it("should allow using SharePermission in a share object", () => {
      interface Share {
        userId: string;
        permission: SharePermission;
      }

      const share: Share = {
        userId: "user-123",
        permission: SharePermission.EDIT,
      };

      expect(share.permission).toBe(SharePermission.EDIT);
    });

    it("should allow JwtPayload with string userId", () => {
      const createPayload = (userId: string): JwtPayload => ({
        userId,
      });

      const payload = createPayload("test-user-id");
      expect(payload.userId).toBe("test-user-id");
    });
  });
});
