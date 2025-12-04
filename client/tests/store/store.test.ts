import { loginUser, logout } from "@/store/slices/authSlice";
import { setTheme } from "@/store/slices/themeSlice";
import { setSidebarWidth, setTaskCardSize } from "@/store/slices/uiSlice";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  setAuthToken: vi.fn(),
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  apiErrorMessage: vi.fn(),
}));

describe("Redux Store - Persistencia", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.resetModules();
  });

  it("Inicializa el store con valores de localStorage cuando están disponibles", async () => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("token", "test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "1", username: "testuser", email: "test@test.com" }),
    );

    const { store } = await import("@/store/store");

    const state = store.getState();
    expect(state.theme.theme).toBe("dark");
    expect(state.auth.token).toBe("test-token");
    expect(state.auth.user).toEqual({
      id: "1",
      username: "testuser",
      email: "test@test.com",
    });
  });

  it("Inicializa el tema oscuro aplicando la clase al document element", async () => {
    localStorage.setItem("theme", "dark");

    await import("@/store/store");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("Inicializa el tema claro sin aplicar la clase dark", async () => {
    localStorage.setItem("theme", "light");

    await import("@/store/store");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("Persiste el token en localStorage cuando cambia", async () => {
    const { store } = await import("@/store/store");
    const { setAuthToken } = await import("@/lib/api");

    const user = {
      id: "1",
      name: "Test User",
      username: "testuser",
      email: "test@test.com",
    };
    const token = "new-token-123";

    store.dispatch(
      loginUser.fulfilled({ user, token }, "", { email: "", password: "" }),
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(localStorage.getItem("token")).toBe(token);
    expect(setAuthToken).toHaveBeenCalledWith(token);
  });

  it("Persiste el usuario en localStorage cuando cambia", async () => {
    const { store } = await import("@/store/store");

    const user = {
      id: "1",
      name: "Test User",
      username: "testuser",
      email: "test@test.com",
    };
    const token = "new-token-123";

    store.dispatch(
      loginUser.fulfilled({ user, token }, "", { email: "", password: "" }),
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(localStorage.getItem("user")).toBe(JSON.stringify(user));
  });

  it("Elimina token y usuario del localStorage al hacer logout", async () => {
    const { store } = await import("@/store/store");
    const { setAuthToken } = await import("@/lib/api");

    const user = {
      id: "1",
      name: "Test User",
      username: "testuser",
      email: "test@test.com",
    };
    store.dispatch(
      loginUser.fulfilled({ user, token: "token-123" }, "", {
        email: "",
        password: "",
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));

    store.dispatch(logout());
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(setAuthToken).toHaveBeenCalledWith();
  });

  it("Persiste el tema en localStorage cuando cambia", async () => {
    const { store } = await import("@/store/store");

    store.dispatch(setTheme("dark"));

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("Aplica y elimina la clase dark del document element al cambiar tema", async () => {
    const { store } = await import("@/store/store");

    store.dispatch(setTheme("dark"));
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    store.dispatch(setTheme("light"));
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("Persiste el ancho de la sidebar en localStorage", async () => {
    const { store } = await import("@/store/store");

    store.dispatch(setSidebarWidth("wide"));

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(localStorage.getItem("sidebarWidth")).toBe("wide");
  });

  it("Actualiza el tamaño de las tarjetas en el state", async () => {
    const { store } = await import("@/store/store");

    const initialSize = store.getState().ui.taskCardSize;
    expect([2, 3, 4]).toContain(initialSize);

    store.dispatch(setTaskCardSize(2));

    expect(store.getState().ui.taskCardSize).toBe(2);
  });

  it("Actualiza múltiples valores de UI en el state", async () => {
    const { store } = await import("@/store/store");

    store.dispatch(setSidebarWidth("normal"));
    store.dispatch(setTaskCardSize(3));

    expect(store.getState().ui.sidebarWidth).toBe("normal");
    expect(store.getState().ui.taskCardSize).toBe(3);
  });
});
