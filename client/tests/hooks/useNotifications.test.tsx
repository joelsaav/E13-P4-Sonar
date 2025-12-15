import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { api } from "@/lib/api";
import type { Notification } from "@/types/notification";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
  apiErrorMessage: vi.fn((err) => (err as Error).message),
}));

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "SYSTEM",
      title: "Notificación 1",
      description: "Descripción 1",
      read: false,
      createdAt: new Date().toISOString(),
      actorName: "Usuario 1",
      userId: "user1",
    },
    {
      id: "2",
      type: "SHARED",
      title: "Notificación 2",
      description: "Descripción 2",
      read: true,
      createdAt: new Date().toISOString(),
      actorName: "Usuario 2",
      userId: "user1",
    },
  ];

  const createWrapper = () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        notifications: notificationsReducer,
      },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  it("Carga notificaciones al montar el componente", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: false,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({ data: mockNotifications });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(api.get).toHaveBeenCalledWith("/notifications");
  });

  it("Maneja errores al cargar notificaciones", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: false,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockRejectedValue(new Error("Error de red"));

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Error de red");

    consoleErrorSpy.mockRestore();
  });

  it("Configura polling cuando pushNotifications está activado", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: true,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({ data: mockNotifications });

    renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/notifications");
    });
  });

  it("No configura polling cuando pushNotifications está desactivado", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: false,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({ data: mockNotifications });

    renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/notifications");
    });
  });

  it("Marca una notificación como leída correctamente", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: false,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({ data: mockNotifications });
    vi.mocked(api.patch).mockResolvedValue({
      data: { ...mockNotifications[0], read: true },
    });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.markAsRead("1");

    expect(api.patch).toHaveBeenCalledWith("/notifications/1/read");
    await waitFor(() => {
      expect(result.current.notifications.find((n) => n.id === "1")?.read).toBe(
        true,
      );
    });
  });

  it("Maneja errores al marcar notificación como leída", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: false,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({ data: mockNotifications });
    vi.mocked(api.patch).mockRejectedValue(new Error("Error de red"));

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.markAsRead("1")).rejects.toThrow();

    consoleErrorSpy.mockRestore();
  });

  it("Marca todas las notificaciones como leídas", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: false,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({ data: mockNotifications });
    vi.mocked(api.patch).mockResolvedValue({ data: undefined });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.markAllAsRead();

    expect(api.patch).toHaveBeenCalledWith("/notifications/read-all");
    await waitFor(() => {
      expect(result.current.notifications.every((n) => n.read)).toBe(true);
    });
  });

  it("Maneja errores al marcar todos como leído", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: false,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({ data: mockNotifications });
    vi.mocked(api.patch).mockRejectedValue(new Error("Error de red"));

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.markAllAsRead()).rejects.toThrow();

    consoleErrorSpy.mockRestore();
  });

  it("Calcula correctamente el contador de notificaciones no leídas", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: false,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({ data: mockNotifications });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(1);
  });

  it("Permite recargar notificaciones manualmente", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        name: "Test User",
        email: "test@test.com",
        pushNotifications: false,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({ data: mockNotifications });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledTimes(1);

    await result.current.loadNotifications();

    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
