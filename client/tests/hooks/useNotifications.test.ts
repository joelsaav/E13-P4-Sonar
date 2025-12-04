import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import * as api from "@/lib/api";
import type { Notification } from "@/types/notification";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  fetchNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
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
      type: "GENERAL",
      title: "Notificación 1",
      description: "Descripción 1",
      read: false,
      createdAt: new Date().toISOString(),
      actorName: "Usuario 1",
      userId: "user1",
    },
    {
      id: "2",
      type: "MENTION",
      title: "Notificación 2",
      description: "Descripción 2",
      read: true,
      createdAt: new Date().toISOString(),
      actorName: "Usuario 2",
      userId: "user1",
    },
  ];

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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(api.fetchNotifications).toHaveBeenCalledTimes(1);
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

    vi.mocked(api.fetchNotifications).mockRejectedValue(
      new Error("Error de red"),
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      "No se pudieron cargar las notificaciones",
    );
    expect(consoleErrorSpy).toHaveBeenCalled();

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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);

    renderHook(() => useNotifications());

    await waitFor(() => {
      expect(api.fetchNotifications).toHaveBeenCalled();
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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);

    renderHook(() => useNotifications());

    await waitFor(() => {
      expect(api.fetchNotifications).toHaveBeenCalled();
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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(api.markNotificationAsRead).mockResolvedValue({
      id: "1",
      userId: "1",
      type: "GENERAL",
      title: "Test",
      description: "Test notification",
      actorName: "Test User",
      read: true,
      createdAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.markAsRead("1");

    expect(api.markNotificationAsRead).toHaveBeenCalledWith("1");
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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(api.markNotificationAsRead).mockRejectedValue(
      new Error("Error de red"),
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.markAsRead("1")).rejects.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();

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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(api.markAllNotificationsAsRead).mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.markAllAsRead();

    expect(api.markAllNotificationsAsRead).toHaveBeenCalled();
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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(api.markAllNotificationsAsRead).mockRejectedValue(
      new Error("Error de red"),
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.markAllAsRead()).rejects.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("Filtra notificaciones por tipo correctamente", async () => {
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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const generalNotifications =
      result.current.getNotificationsByType("GENERAL");
    expect(generalNotifications).toHaveLength(1);
    expect(generalNotifications[0].type).toBe("GENERAL");

    const mentionNotifications =
      result.current.getNotificationsByType("MENTION");
    expect(mentionNotifications).toHaveLength(1);
    expect(mentionNotifications[0].type).toBe("MENTION");
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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotifications());

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

    vi.mocked(api.fetchNotifications).mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.fetchNotifications).toHaveBeenCalledTimes(1);

    await result.current.loadNotifications();

    expect(api.fetchNotifications).toHaveBeenCalledTimes(2);
  });
});
