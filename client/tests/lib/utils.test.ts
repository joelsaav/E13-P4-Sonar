import { cn, firstZodIssueMessage } from "@/lib/utils";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      const condition = false;
      expect(cn("foo", condition && "bar", "baz")).toBe("foo baz");
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
          code: "custom",
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
          code: "custom",
          message: "",
          path: ["name"],
        },
      ]);

      expect(firstZodIssueMessage(error)).toBe(
        "Datos inválidos. Revisa los campos e intenta nuevamente.",
      );
    });

    it("should handle multiple issues and return first", () => {
      const error = new ZodError([
        {
          code: "custom",
          message: "Primer error",
          path: ["name"],
        },
        {
          code: "custom",
          message: "Segundo error",
          path: ["email"],
        },
      ]);

      expect(firstZodIssueMessage(error)).toBe("Primer error");
    });
  });
});
