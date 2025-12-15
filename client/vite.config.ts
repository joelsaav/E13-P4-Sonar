import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5200",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*"],
      exclude: [
        "node_modules/",
        "/tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/**",
        "**/styles/**",
        "**/src/locales/**",
        "**/src/components/ui/**",
        "**/src/types/**",
        "**/src/assets/**",
        "**/src/config/**",
      ],
    },
  },
});
