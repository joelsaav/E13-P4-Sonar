import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import routes from "../../src/routes/routes.js";

const app = express();
app.use(express.json());
app.use("/api", routes);

describe("Routes Integration", () => {
  it("should mount auth routes correctly", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password" });

    expect(response.status).toBe(400);
  });

  it("should mount users routes correctly", async () => {
    const response = await request(app)
      .get("/api/users/profile")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(404);
  });

  it("should mount tasks routes correctly", async () => {
    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });

  it("should mount lists routes correctly", async () => {
    const response = await request(app)
      .get("/api/lists")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });
});