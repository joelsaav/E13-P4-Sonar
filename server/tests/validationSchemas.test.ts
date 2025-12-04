import { describe, it, expect } from "vitest";
import {
  TaskStatus,
  TaskPriority,
  SharePermission,
  registerSchema,
  loginSchema,
  googleAuthSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../src/schemas/validationSchemas";

describe("Validation Schemas", () => {
  describe("Enums", () => {
    describe("TaskStatus", () => {
      it("should accept valid task statuses", () => {
        expect(TaskStatus.parse("PENDING")).toBe("PENDING");
        expect(TaskStatus.parse("IN_PROGRESS")).toBe("IN_PROGRESS");
        expect(TaskStatus.parse("COMPLETED")).toBe("COMPLETED");
      });

      it("should reject invalid task statuses", () => {
        expect(() => TaskStatus.parse("INVALID")).toThrow();
        expect(() => TaskStatus.parse("pending")).toThrow();
        expect(() => TaskStatus.parse("")).toThrow();
      });
    });

    describe("TaskPriority", () => {
      it("should accept valid priorities", () => {
        expect(TaskPriority.parse("LOW")).toBe("LOW");
        expect(TaskPriority.parse("MEDIUM")).toBe("MEDIUM");
        expect(TaskPriority.parse("HIGH")).toBe("HIGH");
        expect(TaskPriority.parse("URGENT")).toBe("URGENT");
      });

      it("should reject invalid priorities", () => {
        expect(() => TaskPriority.parse("INVALID")).toThrow();
        expect(() => TaskPriority.parse("low")).toThrow();
        expect(() => TaskPriority.parse("")).toThrow();
      });
    });

    describe("SharePermission", () => {
      it("should accept valid share permissions", () => {
        expect(SharePermission.parse("VIEW")).toBe("VIEW");
        expect(SharePermission.parse("EDIT")).toBe("EDIT");
        expect(SharePermission.parse("ADMIN")).toBe("ADMIN");
      });

      it("should reject invalid share permissions", () => {
        expect(() => SharePermission.parse("INVALID")).toThrow();
        expect(() => SharePermission.parse("view")).toThrow();
        expect(() => SharePermission.parse("")).toThrow();
      });
    });
  });

  describe("Auth Schemas", () => {
    describe("registerSchema", () => {
      it("should accept valid registration data", () => {
        const validData = {
          name: "John Doe",
          email: "john@example.com",
          password: "Password123",
        };
        expect(registerSchema.parse(validData)).toEqual(validData);
      });

      it("should reject empty name", () => {
        const invalidData = {
          name: "",
          email: "john@example.com",
          password: "Password123",
        };
        expect(() => registerSchema.parse(invalidData)).toThrow(
          "El nombre es obligatorio",
        );
      });

      it("should reject invalid email", () => {
        const invalidData = {
          name: "John Doe",
          email: "invalid-email",
          password: "Password123",
        };
        expect(() => registerSchema.parse(invalidData)).toThrow(
          "Email inválido",
        );
      });

      it("should reject password without uppercase", () => {
        const invalidData = {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        };
        expect(() => registerSchema.parse(invalidData)).toThrow(
          "Password must contain uppercase letter",
        );
      });

      it("should reject password without lowercase", () => {
        const invalidData = {
          name: "John Doe",
          email: "john@example.com",
          password: "PASSWORD123",
        };
        expect(() => registerSchema.parse(invalidData)).toThrow(
          "Password must contain lowercase letter",
        );
      });

      it("should reject password without number", () => {
        const invalidData = {
          name: "John Doe",
          email: "john@example.com",
          password: "Password",
        };
        expect(() => registerSchema.parse(invalidData)).toThrow(
          "Password must contain a number",
        );
      });

      it("should reject password shorter than 6 characters", () => {
        const invalidData = {
          name: "John Doe",
          email: "john@example.com",
          password: "Pa1",
        };
        expect(() => registerSchema.parse(invalidData)).toThrow(
          "Password must be at least 6 characters",
        );
      });
    });

    describe("loginSchema", () => {
      it("should accept valid login data", () => {
        const validData = {
          email: "john@example.com",
          password: "Password123",
        };
        expect(loginSchema.parse(validData)).toEqual(validData);
      });

      it("should reject invalid email", () => {
        const invalidData = {
          email: "invalid-email",
          password: "Password123",
        };
        expect(() => loginSchema.parse(invalidData)).toThrow("Email inválido");
      });

      it("should reject invalid password", () => {
        const invalidData = {
          email: "john@example.com",
          password: "weak",
        };
        expect(() => loginSchema.parse(invalidData)).toThrow();
      });
    });

    describe("googleAuthSchema", () => {
      it("should accept valid ID token", () => {
        const validData = { idToken: "valid-token-string" };
        expect(googleAuthSchema.parse(validData)).toEqual(validData);
      });

      it("should reject empty ID token", () => {
        const invalidData = { idToken: "" };
        expect(() => googleAuthSchema.parse(invalidData)).toThrow(
          "ID Token is required",
        );
      });

      it("should reject missing ID token", () => {
        expect(() => googleAuthSchema.parse({})).toThrow();
      });
    });

    describe("changePasswordSchema", () => {
      it("should accept valid password change data", () => {
        const validData = {
          currentPassword: "OldPassword123",
          newPassword: "NewPassword456",
        };
        expect(changePasswordSchema.parse(validData)).toEqual(validData);
      });

      it("should reject empty current password", () => {
        const invalidData = {
          currentPassword: "",
          newPassword: "NewPassword456",
        };
        expect(() => changePasswordSchema.parse(invalidData)).toThrow(
          "Current password is required",
        );
      });

      it("should reject weak new password", () => {
        const invalidData = {
          currentPassword: "OldPassword123",
          newPassword: "weak",
        };
        expect(() => changePasswordSchema.parse(invalidData)).toThrow();
      });

      it("should reject new password without uppercase", () => {
        const invalidData = {
          currentPassword: "OldPassword123",
          newPassword: "newpassword123",
        };
        expect(() => changePasswordSchema.parse(invalidData)).toThrow(
          "Password must contain uppercase letter",
        );
      });

      it("should reject new password without lowercase", () => {
        const invalidData = {
          currentPassword: "OldPassword123",
          newPassword: "NEWPASSWORD123",
        };
        expect(() => changePasswordSchema.parse(invalidData)).toThrow(
          "Password must contain lowercase letter",
        );
      });

      it("should reject new password without number", () => {
        const invalidData = {
          currentPassword: "OldPassword123",
          newPassword: "NewPassword",
        };
        expect(() => changePasswordSchema.parse(invalidData)).toThrow(
          "Password must contain a number",
        );
      });
    });
  });

  describe("User Schemas", () => {
    describe("updateProfileSchema", () => {
      it("should accept valid profile data", () => {
        const validData = {
          name: "John Doe",
          emailNotifications: true,
          pushNotifications: false,
        };
        expect(updateProfileSchema.parse(validData)).toEqual(validData);
      });
    });
  });
});
