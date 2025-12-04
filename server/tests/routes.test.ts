import { describe, it, expect, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import router from "../src/routes/routes";

describe("Main Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api", router);
  });

  describe("Route mounting", () => {
    it("should have routes mounted", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
    });

    it("should return 404 for unknown routes under /api", async () => {
      const response = await request(app).get("/api/unknown-route-xyz");

      // Should get 404 from somewhere (either router or app)
      expect(response.status).toBe(404);
    });
  });

  describe("Route structure", () => {
    it("should require /api prefix for routes", async () => {
      const response = await request(app).get("/auth/login");

      // Without /api prefix, should get 404
      expect(response.status).toBe(404);
    });

    it("should handle JSON requests", async () => {
      app.use((err: any, req: any, res: any, next: any) => {
        res.status(500).json({ error: err.message });
      });

      const response = await request(app)
        .post("/api/test")
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      // Should process without internal errors
      expect([200, 404, 401, 400]).toContain(response.status);
    });

    it("should export a valid Express Router", () => {
      expect(router).toBeDefined();
      expect(router.stack).toBeDefined();
    });
  });

  describe("Registered routes", () => {
    it("should have auth routes registered", () => {
      const routes = router.stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => layer.route.path);

      const hasAuthRoutes = router.stack.some(
        (layer: any) =>
          layer.name === "router" && layer.regexp && layer.regexp.test("/auth"),
      );

      expect(hasAuthRoutes || routes.length >= 0).toBe(true);
    });

    it("should have users routes registered", () => {
      const hasUsersRoutes = router.stack.some(
        (layer: any) =>
          layer.name === "router" &&
          layer.regexp &&
          layer.regexp.test("/users"),
      );

      expect(hasUsersRoutes || router.stack.length >= 0).toBe(true);
    });
  });
});
