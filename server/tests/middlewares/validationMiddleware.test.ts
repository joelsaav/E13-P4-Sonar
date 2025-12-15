import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  validate,
  validateBody,
  validateParams,
  validateQuery,
} from "../../src/middleware/validationMiddleware";

describe("ValidationMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe("validate", () => {
    it("should handle non-Zod errors with 500 status", () => {
      const errorSchema = {
        parse: vi.fn(() => {
          throw new Error("Unexpected error");
        }),
      } as any;

      mockRequest.body = { name: "Test" };

      const middleware = validate(errorSchema, "body");
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error during validation",
      });
    });
  });

  describe("validateBody", () => {
    it("should create middleware for body validation", () => {
      const schema = z.object({ name: z.string() });
      mockRequest.body = { name: "Test" };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject invalid body data", () => {
      const schema = z.object({ name: z.string() });
      mockRequest.body = { name: 123 };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe("validateQuery", () => {
    it("should create middleware for query validation", () => {
      const schema = z.object({ page: z.string() });
      mockRequest.query = { page: "1" };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject invalid query data", () => {
      const schema = z.object({ page: z.string().regex(/^\d+$/) });
      mockRequest.query = { page: "invalid" };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe("validateParams", () => {
    it("should create middleware for params validation", () => {
      const schema = z.object({ id: z.string().uuid() });
      mockRequest.params = { id: "123e4567-e89b-12d3-a456-426614174000" };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject invalid params data", () => {
      const schema = z.object({ id: z.string().uuid() });
      mockRequest.params = { id: "not-a-uuid" };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});
