import { describe, it, expect } from "vitest";
import { cn, firstZodIssueMessage } from "@/lib/utils";
import { ZodError } from "zod";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });

    it("should merge tailwind classes", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("should handle empty inputs", () => {
      expect(cn()).toBe("");
    });

    it("should handle undefined and null", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });
  });

  describe("firstZodIssueMessage", () => {
    it("should return first error message from ZodError", () => {
      const error = new ZodError([
        {
          code: "too_small",
          minimum: 1,
          type: "string",
          inclusive: true,
          exact: false,
          message: "El nombre es obligatorio",
          path: ["name"],
        },
      ]);

      expect(firstZodIssueMessage(error)).toBe("El nombre es obligatorio");
    });

    it("should return default message if no issues", () => {
      const error = new ZodError([]);
      expect(firstZodIssueMessage(error)).toBe(
        "Datos inválidos. Revisa los campos e intenta nuevamente.",
      );
    });

    it("should return default message if issue has no message", () => {
      const error = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["name"],
        } as any,
      ]);

      expect(firstZodIssueMessage(error)).toBe(
        "Datos inválidos. Revisa los campos e intenta nuevamente.",
      );
    });

    it("should handle multiple issues and return first", () => {
      const error = new ZodError([
        {
          code: "too_small",
          minimum: 1,
          type: "string",
          inclusive: true,
          exact: false,
          message: "Primer error",
          path: ["name"],
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          message: "Segundo error",
          path: ["email"],
        } as any,
      ]);

      expect(firstZodIssueMessage(error)).toBe("Primer error");
    });
  });
});
