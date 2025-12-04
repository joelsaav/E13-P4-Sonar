import ProtectedRoute from "@/components/auth/protectedRoute";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../helpers/test-utils";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const { useAuth } = await import("@/hooks/useAuth");

describe("ProtectedRoute", () => {
  it("Renderiza los hijos cuando está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    renderWithProviders(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("Navega al inicio cuando no está autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    renderWithProviders(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
