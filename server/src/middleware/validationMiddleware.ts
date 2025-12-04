import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

export const validate = (
  schema: ZodType,
  source: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[source];
      const validatedData = schema.parse(dataToValidate);
      req[source] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        res.status(400).json({
          error: "Validation failed",
          details: errors,
        });
        return;
      }
      res.status(500).json({
        error: "Internal server error during validation",
      });
    }
  };
};

export const validateBody = (schema: ZodType) => validate(schema, "body");
export const validateQuery = (schema: ZodType) => validate(schema, "query");
export const validateParams = (schema: ZodType) => validate(schema, "params");
