import App from "@/App";
import { useAuth } from "@/hooks/useAuth";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/components/appMenubar", () => ({
  default: () => <div data-testid="app-menubar">AppMenubar</div>,
}));

vi.mock("@/components/footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("@/pages/public/landingPage", () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock("@/pages/public/loginPage", () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock("@/pages/public/registerPage", () => ({
  default: () => <div data-testid="register-page">Register Page</div>,
}));

vi.mock("@/pages/public/contactsPage", () => ({
  default: () => <div data-testid="contacts-page">Contacts Page</div>,
}));

vi.mock("@/pages/authenticated/dashboardPage", () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock("@/pages/authenticated/tasksPage", () => ({
  default: () => <div data-testid="tasks-page">Tasks Page</div>,
}));

vi.mock("@/pages/authenticated/SharedPage", () => ({
  default: () => <div data-testid="shared-page">Shared Page</div>,
}));

vi.mock("@/pages/authenticated/settingsPage", () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));

vi.mock("@/components/auth/protectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Renderiza la página de inicio cuando no está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("app-menubar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
  });

  it("Redirige al dashboard cuando está autenticado y accede a la raíz", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", email: "test@test.com", name: "Test User" },
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("landing-page")).not.toBeInTheDocument();
  });

  it("Renderiza la página de login cuando no está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("Renderiza la página de registro cuando no está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("register-page")).toBeInTheDocument();
  });

  it("Renderiza la página del dashboard cuando está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", email: "test@test.com", name: "Test User" },
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
  });

  it("Renderiza la página de tareas cuando está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", email: "test@test.com", name: "Test User" },
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByTestId("tasks-page")).toBeInTheDocument();
  });

  it("Renderiza la página compartida cuando está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", email: "test@test.com", name: "Test User" },
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/shared"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByTestId("shared-page")).toBeInTheDocument();
  });

  it("Renderiza la página de configuración cuando está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", email: "test@test.com", name: "Test User" },
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByTestId("settings-page")).toBeInTheDocument();
  });

  it("Renderiza la página de contactos sin autenticación", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/contacts"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("contacts-page")).toBeInTheDocument();
  });

  it("Redirige a la raíz cuando la ruta no existe y no está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/ruta-inexistente"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
  });

  it("Redirige al dashboard cuando la ruta no existe y está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", email: "test@test.com", name: "Test User" },
      isLoading: false,
      token: null,
      error: null,
      loginWithGoogle: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/ruta-inexistente"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("landing-page")).not.toBeInTheDocument();
  });
});
