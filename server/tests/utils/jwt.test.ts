import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { JwtPayload } from "../../src/types/jwt";
import { generateToken, verifyToken } from "../../src/utils/jwt";

vi.mock("jsonwebtoken");

describe("JWT Utils", () => {
  const mockPayload: JwtPayload = { userId: "123" };
  const mockToken = "mock.jwt.token";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization Warning", () => {
    it("should warn if JWT_SECRET is not set", async () => {
      vi.resetModules();
      process.env.JWT_SECRET = "";
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { generateToken } = await import("../../src/utils/jwt");
      generateToken(mockPayload);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("JWT_SECRET not set"),
      );
    });
  });

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      (vi.mocked(jwt.sign) as unknown as Mock).mockReturnValue(mockToken);

      const result = generateToken(mockPayload);

      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        expect.objectContaining({
          expiresIn: "7d",
          algorithm: "HS256",
          issuer: "taskgrid-api",
        }),
      );
    });
  });

  describe("verifyToken", () => {
    it("should verify and return payload from valid token", () => {
      (vi.mocked(jwt.verify) as unknown as Mock).mockReturnValue(mockPayload);

      const result = verifyToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        expect.any(String),
        expect.objectContaining({
          algorithms: ["HS256"],
          issuer: "taskgrid-api",
        }),
      );
    });

    it("should throw 'Token has expired' for expired tokens", () => {
      const expiredError = new jwt.TokenExpiredError("jwt expired", new Date());
      (vi.mocked(jwt.verify) as unknown as Mock).mockImplementation(() => {
        throw expiredError;
      });

      expect(() => verifyToken(mockToken)).toThrow("Token has expired");
    });

    it("should throw 'Invalid token' for malformed tokens", () => {
      const jsonError = new jwt.JsonWebTokenError("invalid token");
      (vi.mocked(jwt.verify) as unknown as Mock).mockImplementation(() => {
        throw jsonError;
      });

      expect(() => verifyToken(mockToken)).toThrow("Invalid token");
    });

    it("should rethrow other errors", () => {
      const otherError = new Error("Database error");
      (vi.mocked(jwt.verify) as unknown as Mock).mockImplementation(() => {
        throw otherError;
      });

      expect(() => verifyToken(mockToken)).toThrow("Database error");
    });
  });
});
