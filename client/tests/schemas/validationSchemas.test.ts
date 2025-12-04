import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  changePasswordSchema,
  updateNameSchema,
  TaskStatus,
  Priority,
  SharePermission,
} from "@/schemas/validationSchemas";

describe("validationSchemas", () => {
  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password123",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        email: "john@example.com",
        password: "Password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El nombre es obligatorio");
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        password: "Password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password less than 6 characters", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "Pass1",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password without uppercase", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password without lowercase", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "PASSWORD123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "john@example.com",
        password: "Password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "Password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject weak password", () => {
      const invalidData = {
        email: "john@example.com",
        password: "weak",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("googleAuthSchema", () => {
    it("should validate correct google auth data", () => {
      const validData = {
        idToken: "valid-token-123",
      };

      const result = googleAuthSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty idToken", () => {
      const invalidData = {
        idToken: "",
      };

      const result = googleAuthSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    it("should validate correct password change data", () => {
      const validData = {
        currentPassword: "OldPass123",
        newPassword: "NewPass123",
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty current password", () => {
      const invalidData = {
        currentPassword: "",
        newPassword: "NewPass123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject weak new password", () => {
      const invalidData = {
        currentPassword: "OldPass123",
        newPassword: "weak",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateNameSchema", () => {
    it("should validate correct name", () => {
      const validData = {
        name: "John Doe",
      };

      const result = updateNameSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
      };

      const result = updateNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El nombre es obligatorio");
      }
    });
  });

  describe("enums", () => {
    it("should validate TaskStatus enum", () => {
      expect(TaskStatus.parse("PENDING")).toBe("PENDING");
      expect(TaskStatus.parse("IN_PROGRESS")).toBe("IN_PROGRESS");
      expect(TaskStatus.parse("COMPLETED")).toBe("COMPLETED");
    });

    it("should reject invalid TaskStatus", () => {
      expect(() => TaskStatus.parse("INVALID")).toThrow();
    });

    it("should validate Priority enum", () => {
      expect(Priority.parse("LOW")).toBe("LOW");
      expect(Priority.parse("MEDIUM")).toBe("MEDIUM");
      expect(Priority.parse("HIGH")).toBe("HIGH");
      expect(Priority.parse("URGENT")).toBe("URGENT");
    });

    it("should validate SharePermission enum", () => {
      expect(SharePermission.parse("VIEW")).toBe("VIEW");
      expect(SharePermission.parse("EDIT")).toBe("EDIT");
      expect(SharePermission.parse("ADMIN")).toBe("ADMIN");
    });
  });
});
