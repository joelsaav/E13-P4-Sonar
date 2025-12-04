import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import authReducer from "@/store/slices/authSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";
import themeReducer from "@/store/slices/themeSlice";
import { configureStore } from "@reduxjs/toolkit";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
  },
  setAuthToken: vi.fn(),
  apiErrorMessage: (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Error desconocido";
  },
}));

describe("useAuth", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    store = configureStore({
      reducer: {
        auth: authReducer,
        theme: themeReducer,
        lists: listsReducer,
        tasks: tasksReducer,
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <Provider store={store}>{children}</Provider>
    </MemoryRouter>
  );

  it("Retorna el estado inicial de autenticación", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("Inicia sesión exitosamente", async () => {
    const mockResponse = {
      data: {
        token: "token123",
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
        },
      },
    };

    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const loginResult = await result.current.login(
      "test@example.com",
      "Password123",
    );

    await waitFor(() => {
      expect(loginResult.success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe("token123");
    expect(result.current.user?.email).toBe("test@example.com");
  });

  it("Maneja el fallo de inicio de sesión", async () => {
    const error = new Error("Invalid credentials");
    vi.mocked(api.post).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const loginResult = await result.current.login(
      "test@example.com",
      "WrongPassword",
    );

    await waitFor(() => {
      expect(loginResult.success).toBe(false);
    });

    expect(loginResult.error).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("Registra exitosamente", async () => {
    const mockRegisterResponse = { data: {} };
    const mockLoginResponse = {
      data: {
        token: "token123",
        user: {
          id: "1",
          email: "new@example.com",
          name: "New User",
        },
      },
    };

    vi.mocked(api.post)
      .mockResolvedValueOnce(mockRegisterResponse)
      .mockResolvedValueOnce(mockLoginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const registerResult = await result.current.register(
      "New User",
      "new@example.com",
      "Password123",
    );

    await waitFor(() => {
      expect(registerResult.success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it("Maneja el fallo de registro", async () => {
    const error = new Error("Invalid credentials");
    vi.mocked(api.post).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const registerResult = await result.current.register(
      "New User",
      "new@example.com",
      "Password123",
    );

    await waitFor(() => {
      expect(registerResult.success).toBe(false);
    });

    expect(registerResult.error).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("Inicia sesión con Google exitosamente", async () => {
    const mockResponse = {
      data: {
        token: "google-token",
        user: {
          id: "1",
          email: "google@example.com",
          name: "Google User",
        },
      },
    };

    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const googleResult =
      await result.current.loginWithGoogle("google-id-token");

    await waitFor(() => {
      expect(googleResult.success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it("Maneja el fallo de inicio de sesión con Google", async () => {
    const error = new Error("Invalid credentials");
    vi.mocked(api.post).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const googleResult =
      await result.current.loginWithGoogle("google-id-token");

    await waitFor(() => {
      expect(googleResult.success).toBe(false);
    });

    expect(googleResult.error).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("Cierra sesión", async () => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        theme: themeReducer,
        lists: listsReducer,
        tasks: tasksReducer,
      },
      preloadedState: {
        auth: {
          user: { id: "1", email: "test@example.com", name: "Test" },
          token: "token123",
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitializing: false,
        },
      },
    });

    const wrapperWithAuth = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapperWithAuth,
    });

    result.current.signOut();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });
  });
});
