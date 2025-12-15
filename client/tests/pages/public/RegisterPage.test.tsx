import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RegisterPage from "@/pages/public/registerPage";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import themeReducer from "@/store/slices/themeSlice";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/auth/LoginForm", () => ({
  LoginForm: ({ forceMode, linkTo }: { forceMode: string; linkTo: string }) => (
    <div data-testid="login-form">
      <span data-testid="force-mode">{forceMode}</span>
      <span data-testid="link-to">{linkTo}</span>
    </div>
  ),
}));

describe("RegisterPage", () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitializing: false,
      },
    },
  });

  it("renders LoginForm with correct props", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.getByTestId("force-mode")).toHaveTextContent("register");
    expect(screen.getByTestId("link-to")).toHaveTextContent("/login");
  });
});
