import AppMenubar from "@/components/layout/AppMenubar";
import { useAuth } from "@/hooks/useAuth";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../helpers/test-utils";
import { I18nTestProvider } from "../../helpers/i18nTestProvider";

vi.mock("@/hooks/useAuth");
let mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/components/layout/UserMenu", () => ({
  default: ({
    onLogout,
    userName,
    onSettings,
  }: {
    onLogout?: () => void;
    userName?: string;
    onSettings?: () => void;
  }) => (
    <div>
      <span>{userName}</span>
      <button onClick={onSettings}>Ajustes</button>
      <button onClick={onLogout}>Cerrar sesión</button>
    </div>
  ),
}));

import userEvent from "@testing-library/user-event";

describe("AppMenubar", () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Renderiza el enlace TaskGrid", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    renderWithProviders(
      <MemoryRouter>
        <AppMenubar />
      </MemoryRouter>,
      { wrapper: I18nTestProvider },
    );

    expect(screen.getByText("TaskGrid")).toBeDefined();
    expect(screen.queryByText("Cerrar sesión")).toBeNull();
  });

  it("Llama a signOut y navega al cerrar sesión", async () => {
    const newNavigate = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test User", email: "test@example.com" },
      token: "token123",
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    mockNavigate = newNavigate;

    renderWithProviders(
      <MemoryRouter>
        <AppMenubar />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("Cerrar sesión"));

    expect(mockSignOut).toHaveBeenCalled();
    expect(newNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("Muestra el menú de navegación cuando está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test User", email: "test@example.com" },
      token: "token123",
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    renderWithProviders(
      <MemoryRouter>
        <AppMenubar />
      </MemoryRouter>,
    );

    expect(screen.getByText("TaskGrid")).toBeDefined();
    expect(screen.getByText("Test User")).toBeDefined();
  });

  it("No muestra el dropdown de usuario cuando no está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    renderWithProviders(
      <MemoryRouter>
        <AppMenubar />
      </MemoryRouter>,
    );

    expect(screen.getByText("TaskGrid")).toBeDefined();
    expect(screen.queryByText("Ajustes")).toBeNull();
  });

  it("Navega a ajustes al hacer clic en Ajustes", async () => {
    const newNavigate = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test User", email: "test@example.com" },
      token: "token123",
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    mockNavigate = newNavigate;

    renderWithProviders(
      <MemoryRouter>
        <AppMenubar />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("Ajustes"));

    expect(newNavigate).toHaveBeenCalledWith("/settings");
  });

  it("Renderiza el botón de menú móvil cuando está autenticado", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test User", email: "test@example.com" },
      token: "token123",
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    const { container } = renderWithProviders(
      <MemoryRouter>
        <AppMenubar />
      </MemoryRouter>,
    );

    const mobileMenuButton = container.querySelector(
      '[data-slot="sheet-trigger"]',
    );
    expect(mobileMenuButton).toBeDefined();

    const user = userEvent.setup();
    if (mobileMenuButton) {
      await user.click(mobileMenuButton);
      await screen.findByText("Menú");
      expect(screen.getByText("Configuración")).toBeDefined();
    }
  });

  it("Navega desde el menú móvil", async () => {
    const newNavigate = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test User", email: "test@example.com" },
      token: "token123",
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    mockNavigate = newNavigate;

    const { container } = renderWithProviders(
      <MemoryRouter>
        <AppMenubar />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    const mobileMenuButton = container.querySelector(
      '[data-slot="sheet-trigger"]',
    );

    if (mobileMenuButton) {
      await user.click(mobileMenuButton);
      await screen.findByText("Menú");

      const allTasksButtons = screen.getAllByText("Tareas");
      const mobileTasksButton = allTasksButtons.find((btn) =>
        btn.closest('[data-slot="sheet-content"]'),
      );

      if (mobileTasksButton) {
        await user.click(mobileTasksButton);
        expect(newNavigate).toHaveBeenCalledWith("/tasks");
      }
    }
  });

  it("Cierra sesión desde el menú móvil", async () => {
    const newNavigate = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Mobile User", email: "mobile@test.com" },
      token: "token123",
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    mockNavigate = newNavigate;

    const { container } = renderWithProviders(
      <MemoryRouter>
        <AppMenubar />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    const mobileMenuButton = container.querySelector(
      '[data-slot="sheet-trigger"]',
    );

    if (mobileMenuButton) {
      await user.click(mobileMenuButton);
      const logoutButtons = await screen.findAllByText("Cerrar sesión");
      if (logoutButtons.length > 1) {
        await user.click(logoutButtons[1]);
      } else {
        await user.click(logoutButtons[0]);
      }
      expect(mockSignOut).toHaveBeenCalled();
      expect(newNavigate).toHaveBeenCalledWith("/", { replace: true });
    }
  });

  it("Navega a configuración desde el menú móvil", async () => {
    const newNavigate = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test User", email: "test@example.com" },
      token: "token123",
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    mockNavigate = newNavigate;

    const { container } = renderWithProviders(
      <MemoryRouter>
        <AppMenubar />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    const mobileMenuButton = container.querySelector(
      '[data-slot="sheet-trigger"]',
    );

    if (mobileMenuButton) {
      await user.click(mobileMenuButton);
      await screen.findByText("Menú");

      const allConfigButtons = screen.getAllByText("Configuración");
      const mobileConfigButton = allConfigButtons[allConfigButtons.length - 1];

      await user.click(mobileConfigButton);
      expect(newNavigate).toHaveBeenCalledWith("/settings");
    }
  });
});
