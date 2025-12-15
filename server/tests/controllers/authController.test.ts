import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  changePassword,
  googleSignIn,
  login,
  register,
} from "../../src/controllers/authController";
import { createNotification } from "../../src/controllers/notificationsController";
import prisma from "../../src/database/prisma";
import * as jwtUtils from "../../src/utils/jwt";

vi.mock("../../src/database/prisma", () => ({
  default: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../src/utils/jwt");
vi.mock("bcrypt");
vi.mock("../../src/controllers/notificationsController", () => ({
  createNotification: vi.fn(),
}));

vi.mock("../../src/utils/socket", () => ({
  getIO: vi.fn().mockReturnValue({
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  }),
}));

const { mockVerifyIdToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken = mockVerifyIdToken;
  },
}));

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

describe("AuthController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password123",
      };

      mockRequest.body = userData;

      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: "user-123",
        email: userData.email,
        name: userData.name,
        password: "hashed-password",
      } as any);
      vi.mocked(jwtUtils.generateToken).mockReturnValue("jwt-token");

      await register(mockRequest as Request, mockResponse as Response);

      expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          name: userData.name,
          password: "hashed-password",
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
      expect(jwtUtils.generateToken).toHaveBeenCalledWith({
        userId: "user-123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: "user-123",
          email: userData.email,
          name: userData.name,
        }),
        token: "jwt-token",
      });
      expect(createNotification).toHaveBeenCalledWith(
        "user-123",
        "SYSTEM",
        "¡Bienvenido a Task Grid!",
        "Gracias por unirte a nuestra plataforma. Esperamos que disfrutes organizando tus tareas.",
        "Sistema",
      );
    });

    it("should return 400 if email already exists", async () => {
      mockRequest.body = {
        name: "John Doe",
        email: "existing@example.com",
        password: "Password123",
      };

      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
      vi.mocked(prisma.user.create).mockRejectedValue({
        code: "P2002",
      });

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "A user with this email already exists.",
      });
    });

    it("should return 500 on database error", async () => {
      mockRequest.body = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password123",
      };

      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
      vi.mocked(prisma.user.create).mockRejectedValue(new Error("DB Error"));

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Error creating user.",
      });
    });
  });

  describe("login", () => {
    it("should login user with valid credentials", async () => {
      const loginData = {
        email: "john@example.com",
        password: "Password123",
      };

      mockRequest.body = loginData;

      const mockUser = {
        id: "user-123",
        email: loginData.email,
        name: "John Doe",
        password: "hashed-password",
        emailNotifications: true,
        pushNotifications: false,
        image: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwtUtils.generateToken).mockReturnValue("jwt-token");

      await login(mockRequest as Request, mockResponse as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Login successful.",
        token: "jwt-token",
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          emailNotifications: mockUser.emailNotifications,
          pushNotifications: mockUser.pushNotifications,
          image: mockUser.image,
          isGoogleAuthUser: false,
        },
      });
    });

    it("should return 400 for invalid email", async () => {
      mockRequest.body = {
        email: "nonexistent@example.com",
        password: "Password123",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid email.",
      });
    });

    it("should return 400 for user without password", async () => {
      mockRequest.body = {
        email: "oauth@example.com",
        password: "Password123",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        email: "oauth@example.com",
        password: null,
      } as any);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid email.",
      });
    });

    it("should return 400 for wrong password", async () => {
      mockRequest.body = {
        email: "john@example.com",
        password: "WrongPassword",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        email: "john@example.com",
        password: "hashed-password",
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Wrong password.",
      });
    });

    it("should return 500 on database error", async () => {
      mockRequest.body = {
        email: "john@example.com",
        password: "Password123",
      };

      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error("DB Error"),
      );

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Error logging in user.",
      });
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { id: "user-123" };
      authRequest.body = {
        currentPassword: "OldPassword123",
        newPassword: "NewPassword456",
      };

      const mockUser = {
        id: "user-123",
        email: "john@example.com",
        password: "hashed-old-password",
        googleSub: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-new-password" as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      await changePassword(authRequest as Request, mockResponse as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "OldPassword123",
        "hashed-old-password",
      );
      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword456", 12);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { password: "hashed-new-password" },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Password changed successfully",
      });
    });

    it("should return 404 if user not found", async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { id: "nonexistent-user" };
      authRequest.body = {
        currentPassword: "OldPassword123",
        newPassword: "NewPassword456",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await changePassword(authRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    it("should return 400 for OAuth users", async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { id: "user-123" };
      authRequest.body = {
        currentPassword: "OldPassword123",
        newPassword: "NewPassword456",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        googleSub: "google-123",
        password: null,
      } as any);

      await changePassword(authRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Cannot change password for OAuth (Google) users",
      });
    });

    it("should return 401 for incorrect current password", async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { id: "user-123" };
      authRequest.body = {
        currentPassword: "WrongPassword",
        newPassword: "NewPassword456",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        password: "hashed-password",
        googleSub: null,
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await changePassword(authRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Current password is incorrect",
      });
    });

    it("should return 500 on database error", async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { id: "user-123" };
      authRequest.body = {
        currentPassword: "OldPassword123",
        newPassword: "NewPassword456",
      };

      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error("DB Error"),
      );

      await changePassword(authRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("googleSignIn", () => {
    it("should return 400 when idToken is missing", async () => {
      mockRequest.body = {};

      await googleSignIn(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "ID token is required",
      });
    });

    it("should return 500 if Google Auth is not configured", async () => {
      vi.resetModules();
      const originalClientId = process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_ID;
      const { googleSignIn: googleSignInFresh } =
        await import("../../src/controllers/authController");

      mockRequest.body = { idToken: "some-token" };
      await googleSignInFresh(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Google authentication not configured",
      });

      process.env.GOOGLE_CLIENT_ID = originalClientId;
    });

    it("should return 401 if verification fails", async () => {
      mockRequest.body = { idToken: "invalid-token" };
      mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));

      await googleSignIn(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Failed to authenticate with Google",
      });
    });

    it("should return 400 if Google payload is invalid", async () => {
      mockRequest.body = { idToken: "valid-token-missing-email" };
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: "google-123",
          email_verified: true,
        }),
      });

      await googleSignIn(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid Google credentials",
      });
    });

    it("should login existing user with googleSub", async () => {
      mockRequest.body = { idToken: "valid-token" };
      const payload = {
        email: "john@example.com",
        sub: "google-123",
        email_verified: true,
        name: "John Doe",
        picture: "pic.jpg",
      };
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => payload,
      });

      const mockUser = {
        id: "user-123",
        email: "john@example.com",
        name: "John Doe",
        image: "pic.jpg",
        googleSub: "google-123",
        emailNotifications: true,
        pushNotifications: false,
      };

      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);
      vi.mocked(jwtUtils.generateToken).mockReturnValue("jwt-token");

      await googleSignIn(mockRequest as Request, mockResponse as Response);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { googleSub: "google-123" },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: "jwt-token",
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          image: mockUser.image,
          emailNotifications: true,
          pushNotifications: false,
          isGoogleAuthUser: true,
        },
      });
    });

    it("should link existing account by email if googleSub not set", async () => {
      mockRequest.body = { idToken: "valid-token" };
      const payload = {
        email: "john@example.com",
        sub: "google-123",
        email_verified: true,
        name: "John Doe",
        picture: "pic.jpg",
      };
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => payload,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const existingUser = {
        id: "user-123",
        email: "john@example.com",
        name: "John Doe",
        image: null,
        googleSub: null,
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any);

      const updatedUser = {
        ...existingUser,
        googleSub: "google-123",
      };
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as any);
      vi.mocked(jwtUtils.generateToken).mockReturnValue("jwt-token");

      await googleSignIn(mockRequest as Request, mockResponse as Response);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { googleSub: "google-123" },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { googleSub: "google-123" },
      });

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: "jwt-token",
          user: expect.objectContaining({
            id: "user-123",
            isGoogleAuthUser: true,
          }),
        }),
      );
    });

    it("should create new user if not exists", async () => {
      mockRequest.body = { idToken: "valid-token" };
      const payload = {
        email: "new@example.com",
        sub: "google-new",
        email_verified: true,
        name: "New User",
        picture: "pic.jpg",
      };
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => payload,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const newUser = {
        id: "new-user-123",
        email: "new@example.com",
        name: "New User",
        image: "pic.jpg",
        googleSub: "google-new",
        emailNotifications: true,
        pushNotifications: false,
      };
      vi.mocked(prisma.user.create).mockResolvedValue(newUser as any);
      vi.mocked(jwtUtils.generateToken).mockReturnValue("jwt-token");

      await googleSignIn(mockRequest as Request, mockResponse as Response);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "new@example.com",
          name: "New User",
          password: null,
          googleSub: "google-new",
          image: "pic.jpg",
          emailVerifiedAt: expect.any(Date),
        },
      });

      expect(createNotification).toHaveBeenCalled();

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: "jwt-token",
          user: expect.objectContaining({
            id: "new-user-123",
            email: "new@example.com",
          }),
        }),
      );
    });

    it("should use email prefix as name if name is missing from Google payload", async () => {
      mockRequest.body = { idToken: "valid-token" };
      const payload = {
        email: "nameless@example.com",
        sub: "google-nameless",
        email_verified: true,
        picture: "pic.jpg",
      };
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => payload,
      });

      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const newUser = {
        id: "new-user-123",
        email: "nameless@example.com",
        name: "nameless",
        image: "pic.jpg",
        googleSub: "google-nameless",
      };
      vi.mocked(prisma.user.create).mockResolvedValue(newUser as any);
      vi.mocked(jwtUtils.generateToken).mockReturnValue("jwt-token");

      await googleSignIn(mockRequest as Request, mockResponse as Response);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "nameless@example.com",
          name: "nameless",
          password: null,
          googleSub: "google-nameless",
          image: "pic.jpg",
          emailVerifiedAt: expect.any(Date),
        },
      });

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            name: "nameless",
          }),
        }),
      );
    });
  });
});
