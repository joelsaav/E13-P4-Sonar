import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  validate,
  validateBody,
  validateQuery,
  validateParams,
} from "../src/middleware/validationMiddleware";

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
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().min(0),
    });

    it("should validate and pass valid body data", () => {
      mockRequest.body = { name: "John", age: 25 };

      const middleware = validate(testSchema, "body");
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockRequest.body).toEqual({ name: "John", age: 25 });
    });

    it("should validate and pass valid query data", () => {
      mockRequest.query = { name: "John", age: "25" };

      const querySchema = z.object({
        name: z.string(),
        age: z.string(),
      });

      const middleware = validate(querySchema, "query");
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should validate and pass valid params data", () => {
      mockRequest.params = { id: "123" };

      const paramsSchema = z.object({
        id: z.string(),
      });

      const middleware = validate(paramsSchema, "params");
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should reject invalid data with validation errors", () => {
      mockRequest.body = { name: "", age: -5 };

      const middleware = validate(testSchema, "body");
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Validation failed",
          details: expect.any(Array),
        }),
      );
    });

    it("should include field names and messages in error details", () => {
      mockRequest.body = { name: "", age: "invalid" };

      const middleware = validate(testSchema, "body");
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const jsonCall = vi.mocked(mockResponse.json!).mock.calls[0][0];
      expect(jsonCall).toHaveProperty("details");
      expect(Array.isArray(jsonCall.details)).toBe(true);
      expect(jsonCall.details.length).toBeGreaterThan(0);
      expect(jsonCall.details[0]).toHaveProperty("field");
      expect(jsonCall.details[0]).toHaveProperty("message");
    });

    it("should handle missing required fields", () => {
      mockRequest.body = {};

      const middleware = validate(testSchema, "body");
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Validation failed",
        }),
      );
    });

    it("should handle nested validation errors", () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string().min(1),
          email: z.string().email(),
        }),
      });

      mockRequest.body = {
        user: {
          name: "",
          email: "invalid-email",
        },
      };

      const middleware = validate(nestedSchema, "body");
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);

      const jsonCall = vi.mocked(mockResponse.json!).mock.calls[0][0];
      expect(jsonCall.details).toBeDefined();
      expect(jsonCall.details.some((e: any) => e.field.includes("user"))).toBe(
        true,
      );
    });

    it("should transform data according to schema", () => {
      const transformSchema = z.object({
        age: z.string().transform((val) => parseInt(val, 10)),
      });

      mockRequest.body = { age: "25" };

      const middleware = validate(transformSchema, "body");
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.body).toEqual({ age: 25 });
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
