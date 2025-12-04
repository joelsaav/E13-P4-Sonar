import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification";
import { render, screen, waitFor } from "@testing-library/react";
import { I18nTestProvider } from "../../testUtils/i18nTestProvider";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useNotifications", () => ({
  useNotifications: vi.fn(),
}));

describe("NotificationBell", () => {
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "GENERAL",
      title: "Nueva tarea asignada",
      description: "Te han asignado la tarea 'Revisar código'",
      read: false,
      createdAt: new Date().toISOString(),
      actorName: "Juan Pérez",
      userId: "user1",
    },
    {
      id: "2",
      type: "MENTION",
      title: "Te mencionaron",
      description: "Juan te mencionó en un comentario",
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
      actorName: "María García",
      userId: "user1",
    },
    {
      id: "3",
      type: "INBOX",
      title: "Mensaje recibido",
      description: "Tienes un nuevo mensaje",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      actorName: "Pedro López",
      userId: "user1",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Renderiza el botón de notificaciones", () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      loading: false,
      error: null,
      unreadCount: 0,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => []),
    });

    render(
      <I18nTestProvider>
        <NotificationBell />
      </I18nTestProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    ).toBeInTheDocument();
  });

  it("Muestra el indicador de notificaciones sin leer", () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => []),
    });

    const { container } = render(<NotificationBell />);

    // Verificar que existe el indicador rojo
    expect(container.querySelector(".bg-red-500")).toBeInTheDocument();
  });

  it("No muestra el indicador cuando no hay notificaciones sin leer", () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications.map((n) => ({ ...n, read: true })),
      loading: false,
      error: null,
      unreadCount: 0,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => []),
    });

    const { container } = render(<NotificationBell />);

    expect(container.querySelector(".bg-red-500")).not.toBeInTheDocument();
  });

  it("Abre la ventana emergente al hacer click en el botón", async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    const button = screen.getByRole("button", {
      name: "Abrir notificaciones",
    });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Notificaciones")).toBeInTheDocument();
    });
  });

  it('Muestra "Todo al día por ahora" cuando no hay notificaciones sin leer', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      loading: false,
      error: null,
      unreadCount: 0,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => []),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Todo al día por ahora")).toBeInTheDocument();
    });
  });

  it('Muestra el contador de notificaciones sin leer en formato "X sin leer"', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    await waitFor(() => {
      expect(screen.getByText("2 sin leer")).toBeInTheDocument();
    });
  });

  it('Muestra el botón "Marcar todo como leído" cuando hay notificaciones sin leer', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /marcar todo como leído/i }),
      ).toBeInTheDocument();
    });
  });

  it("Llama a markAllAsRead al hacer click en marcar todo como leído", async () => {
    const mockMarkAllAsRead = vi.fn();
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: mockMarkAllAsRead,
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    const markAllButton = await screen.findByRole("button", {
      name: /marcar todo como leído/i,
    });
    await user.click(markAllButton);

    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it("Muestra las pestañas de filtrado de notificaciones", async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    // Esperar a que aparezcan las tabs
    await waitFor(
      () => {
        const generalTabs = screen.queryAllByText("General");
        const mencionesTabs = screen.queryAllByText("Menciones");
        const buzonTabs = screen.queryAllByText("Buzón");
        const archivosTabs = screen.queryAllByText("Archivos");

        expect(generalTabs.length).toBeGreaterThan(0);
        expect(mencionesTabs.length).toBeGreaterThan(0);
        expect(buzonTabs.length).toBeGreaterThan(0);
        expect(archivosTabs.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
  });

  it("Filtra notificaciones al cambiar de pestaña", async () => {
    const mockGetNotificationsByType = vi.fn((type) => {
      if (type === "MENTION") {
        return [mockNotifications[1]];
      }
      return mockNotifications;
    });

    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: mockGetNotificationsByType,
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    const mencionesTab = await screen.findAllByText("Menciones");
    await user.click(mencionesTab[0]);

    await waitFor(() => {
      expect(mockGetNotificationsByType).toHaveBeenCalledWith("MENTION");
    });
  });

  it("Muestra estado de carga", async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      loading: true,
      error: null,
      unreadCount: 0,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => []),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Cargando notificaciones..."),
      ).toBeInTheDocument();
    });
  });

  it("Muestra mensaje cuando no hay notificaciones en la pestaña", async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      loading: false,
      error: null,
      unreadCount: 0,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => []),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("No hay notificaciones en esta pestaña."),
      ).toBeInTheDocument();
    });
  });

  it("Llama a markAsRead al hacer click en una notificación", async () => {
    const mockMarkAsRead = vi.fn();
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    const notification = await screen.findByText("Nueva tarea asignada");
    await user.click(notification);

    expect(mockMarkAsRead).toHaveBeenCalledWith("1");
  });

  it("Formatea correctamente las fechas relativas", async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    await waitFor(() => {
      expect(screen.getByText(/Hace \d+ horas/)).toBeInTheDocument();
    });
  });

  it("Maneja errores al marcar como leído", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockMarkAsRead = vi.fn().mockRejectedValue(new Error("Error de red"));

    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    const notification = await screen.findByText("Nueva tarea asignada");
    await user.click(notification);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error al marcar como leído:",
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("Maneja errores al marcar todos como leídos", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockMarkAllAsRead = vi
      .fn()
      .mockRejectedValue(new Error("Error de red"));

    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: mockMarkAllAsRead,
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    const markAllButton = await screen.findByRole("button", {
      name: /marcar todo como leído/i,
    });
    await user.click(markAllButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error al marcar todos como leído:",
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("Muestra el avatar con las iniciales del actor", async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => [mockNotifications[0]]),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    await waitFor(() => {
      expect(screen.getByText("JU")).toBeInTheDocument();
    });
  });

  it("Muestra badges con el tipo de notificación", async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: null,
      unreadCount: 2,
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      getNotificationsByType: vi.fn(() => mockNotifications),
    });

    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: "Abrir notificaciones" }),
    );

    await waitFor(() => {
      expect(screen.getAllByText("General").length).toBeGreaterThan(0);
    });
  });
});
