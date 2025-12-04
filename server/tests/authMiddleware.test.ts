import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { authenticate } from "../src/middleware/authMiddleware";
import * as jwt from "../src/utils/jwt";

vi.mock("../src/utils/jwt");

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

describe("AuthMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should authenticate valid token and set user", () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      vi.mocked(jwt.verifyToken).mockReturnValue({ userId: "user-123" });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verifyToken).toHaveBeenCalledWith("valid-token");
      expect((mockRequest as AuthRequest).user).toEqual({ id: "user-123" });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should reject request without authorization header", () => {
      mockRequest.headers = {};

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "No token provided",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with invalid authorization format", () => {
      mockRequest.headers = {
        authorization: "InvalidFormat token",
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "No token provided",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject invalid token", () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      vi.mocked(jwt.verifyToken).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid token",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject expired token", () => {
      mockRequest.headers = {
        authorization: "Bearer expired-token",
      };

      vi.mocked(jwt.verifyToken).mockImplementation(() => {
        throw new Error("Token has expired");
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Token has expired",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle non-Error exceptions", () => {
      mockRequest.headers = {
        authorization: "Bearer token",
      };

      vi.mocked(jwt.verifyToken).mockImplementation(() => {
        throw "String error";
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid token",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
