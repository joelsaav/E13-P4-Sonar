import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// Mock all dependencies before importing routes
vi.mock("../src/controllers/usersController", () => ({
  getProfile: vi.fn((req, res) => res.status(200).json({ message: "Profile" })),
  deleteAccount: vi.fn((req, res) =>
    res.status(200).json({ message: "Deleted" }),
  ),
  updateProfile: vi.fn((req, res) =>
    res.status(200).json({ message: "Updated" }),
  ),
}));

vi.mock("../src/middleware/authMiddleware", () => ({
  authenticate: vi.fn((req: any, res: any, next: any) => {
    req.user = { id: "user-123" };
    next();
  }),
}));

vi.mock("../src/middleware/validationMiddleware", () => ({
  validateBody: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

vi.mock("../src/schemas/validationSchemas", () => ({
  updateProfileSchema: {},
}));

import usersRoutes from "../src/routes/usersRoutes";
import * as usersController from "../src/controllers/usersController";
import * as authMiddleware from "../src/middleware/authMiddleware";

describe("Users Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/users", usersRoutes);
  });

  describe("GET /users/me", () => {
    it("should call getProfile controller with authentication", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", "Bearer token");

      expect(authMiddleware.authenticate).toHaveBeenCalled();
      expect(usersController.getProfile).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /users/me", () => {
    it("should call deleteAccount controller with authentication", async () => {
      const response = await request(app)
        .delete("/users/me")
        .set("Authorization", "Bearer token");

      expect(authMiddleware.authenticate).toHaveBeenCalled();
      expect(usersController.deleteAccount).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /users/me name", () => {
    it("should call updateProfile controller with authentication", async () => {
      const response = await request(app)
        .patch("/users/me")
        .set("Authorization", "Bearer token")
        .send({ name: "New Name" });

      expect(authMiddleware.authenticate).toHaveBeenCalled();
      expect(usersController.updateProfile).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /users/me email-notifications", () => {
    it("should call updateProfile controller", async () => {
      const response = await request(app)
        .patch("/users/me")
        .set("Authorization", "Bearer token")
        .send({ emailNotifications: true });

      expect(authMiddleware.authenticate).toHaveBeenCalled();
      expect(usersController.updateProfile).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /users/me push-notifications", () => {
    it("should call updateProfile controller", async () => {
      const response = await request(app)
        .patch("/users/me")
        .set("Authorization", "Bearer token")
        .send({ pushNotifications: false });

      expect(authMiddleware.authenticate).toHaveBeenCalled();
      expect(usersController.updateProfile).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
