import { vi, describe, it, expect, beforeEach, afterEach, Mock } from "vitest";
import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "../src/utils/jwt";
import { JwtPayload } from "../src/types/jwt";

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

    it("should call jwt.sign with correct parameters", () => {
      (vi.mocked(jwt.sign) as unknown as Mock).mockReturnValue(mockToken);

      generateToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledTimes(1);
      const calls = vi.mocked(jwt.sign).mock.calls[0];
      expect(calls[0]).toEqual(mockPayload);
      expect(calls[2]).toHaveProperty("algorithm", "HS256");
      expect(calls[2]).toHaveProperty("issuer", "taskgrid-api");
      expect(calls[2]).toHaveProperty("expiresIn", "7d");
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

    it("should throw 'Invalid token' for wrong signature", () => {
      const sigError = new jwt.JsonWebTokenError("invalid signature");
      (vi.mocked(jwt.verify) as unknown as Mock).mockImplementation(() => {
        throw sigError;
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
