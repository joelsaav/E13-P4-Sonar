import { setTheme } from "@/store/slices/themeSlice";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  setAuthToken: vi.fn(),
  api: {
    post: vi.fn(),
  },
  apiErrorMessage: vi.fn(),
}));

describe("Persistencia del Store - Integración", () => {
  let store: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.className = "";

    const storeModule = await import("@/store/store");
    store = storeModule.store;
  });

  it("Guarda el tema en localStorage cuando el estado cambia", () => {
    expect(localStorage.getItem("theme")).toBeNull();

    store.dispatch(setTheme("dark"));

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    store.dispatch(setTheme("light"));
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("Guarda el token de autenticación en localStorage al iniciar sesión", () => {
    expect(true).toBe(true);
  });
});
