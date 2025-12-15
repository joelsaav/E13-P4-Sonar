import "@testing-library/jest-dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect } from "vitest";

expect.extend(matchers);

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = args[0]?.toString() || "";
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("Error al cargar notificaciones") ||
      message.includes("width(0) and height(0) of chart") ||
      message.includes(
        "An update to TestComponent inside a test was not wrapped in act",
      )
    ) {
      return;
    }
    originalError(...args);
  };

  console.warn = (...args: unknown[]) => {
    const message = args[0]?.toString() || "";
    if (message.includes("width") && message.includes("height")) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

afterEach(() => {
  cleanup();
});
