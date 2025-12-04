import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// Mock all dependencies before importing routes
vi.mock("../src/controllers/authController", () => ({
  login: vi.fn((req, res) => res.status(200).json({ message: "Login" })),
  register: vi.fn((req, res) => res.status(201).json({ message: "Register" })),
  googleSignIn: vi.fn((req, res) =>
    res.status(200).json({ message: "Google" }),
  ),
  changePassword: vi.fn((req, res) =>
    res.status(200).json({ message: "Changed" }),
  ),
}));

vi.mock("../src/middleware/validationMiddleware", () => ({
  validateBody: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

vi.mock("../src/middleware/authMiddleware", () => ({
  authenticate: vi.fn((req: any, res: any, next: any) => {
    req.user = { id: "user-123" };
    next();
  }),
}));

vi.mock("../src/schemas/validationSchemas", () => ({
  loginSchema: {},
  registerSchema: {},
  googleAuthSchema: {},
  changePasswordSchema: {},
}));

import authRoutes from "../src/routes/authRoutes";
import * as authController from "../src/controllers/authController";
import * as validationMiddleware from "../src/middleware/validationMiddleware";
import * as authMiddleware from "../src/middleware/authMiddleware";

describe("Auth Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/auth", authRoutes);
  });

  describe("POST /auth/login", () => {
    it("should call login controller", async () => {
      vi.mocked(authController.login).mockImplementation(async (req, res) => {
        return res.status(200).json({ message: "Login successful" });
      });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "Password123" });

      expect(authController.login).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe("POST /auth/register", () => {
    it("should call register controller", async () => {
      vi.mocked(authController.register).mockImplementation(
        async (req, res) => {
          return res.status(201).json({ message: "User created" });
        },
      );

      const response = await request(app).post("/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123",
      });

      expect(authController.register).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });
  });

  describe("POST /auth/google", () => {
    it("should call googleSignIn controller", async () => {
      vi.mocked(authController.googleSignIn).mockImplementation(
        async (req, res) => {
          return res.status(200).json({ message: "Google auth successful" });
        },
      );

      const response = await request(app)
        .post("/auth/google")
        .send({ idToken: "google-token" });

      expect(authController.googleSignIn).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe("PUT /auth/password", () => {
    it("should call changePassword controller with authentication", async () => {
      vi.mocked(authController.changePassword).mockImplementation(
        async (req, res) => {
          return res.status(200).json({ message: "Password changed" });
        },
      );

      const response = await request(app)
        .put("/auth/password")
        .set("Authorization", "Bearer token")
        .send({
          currentPassword: "OldPassword123",
          newPassword: "NewPassword456",
        });

      expect(authMiddleware.authenticate).toHaveBeenCalled();
      expect(authController.changePassword).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
