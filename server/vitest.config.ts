import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,js}"],
      exclude: [
        "src/**/*.d.ts",
        "**/node_modules/**",
        "src/types/**",
        "src/server.ts",
      ],
    },
    env: {
      JWT_SECRET: "test-secret",
    },
  },
});
