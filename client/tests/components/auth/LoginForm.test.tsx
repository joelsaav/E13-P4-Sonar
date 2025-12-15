import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LoginForm } from "@/components/auth/LoginForm";
import { I18nTestProvider } from "../../helpers/i18nTestProvider";
import { BrowserRouter } from "react-router-dom";

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLoginWithGoogle = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: mockLogin,
    register: mockRegister,
    loginWithGoogle: mockLoginWithGoogle,
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <I18nTestProvider>{ui}</I18nTestProvider>
    </BrowserRouter>,
  );
};

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({ success: true });
    mockRegister.mockResolvedValue({ success: true });
  });

  it("renders login form with card and title", () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByText(/iniciar sesión|login/i)).toBeInTheDocument();
  });

  it("renders email input with placeholder", () => {
    renderWithRouter(<LoginForm />);

    expect(
      screen.getByPlaceholderText("JohnDoe@example.com"),
    ).toBeInTheDocument();
  });

  it("renders password input with placeholder", () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithRouter(<LoginForm />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("allows typing in email input", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("JohnDoe@example.com");
    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("allows typing in password input", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText("••••••••");
    await user.type(passwordInput, "password123");

    expect(passwordInput).toHaveValue("password123");
  });

  it("shows name field in register mode", () => {
    renderWithRouter(<LoginForm forceMode="register" />);

    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
  });

  it("renders link to switch modes when linkTo provided", () => {
    renderWithRouter(<LoginForm forceMode="login" linkTo="/register" />);

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/register");
  });

  it("calls login on form submit with valid data", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm forceMode="login" />);

    await user.type(
      screen.getByPlaceholderText("JohnDoe@example.com"),
      "test@example.com",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "Password123");

    const form = screen.getByRole("button", { name: /entrar|acceder|inicia/i });
    await user.click(form);

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "Password123");
  });

  it("calls register on form submit in register mode with valid data", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm forceMode="register" />);

    await user.type(screen.getByPlaceholderText("John Doe"), "Test User");
    await user.type(
      screen.getByPlaceholderText("JohnDoe@example.com"),
      "test@example.com",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "Password123");

    const form = screen.getByRole("button", { name: /registrar/i });
    await user.click(form);

    expect(mockRegister).toHaveBeenCalledWith(
      "Test User",
      "test@example.com",
      "Password123",
    );
  });

  it("shows terms and privacy text", () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByText(/términos|terms/i)).toBeInTheDocument();
  });
});
