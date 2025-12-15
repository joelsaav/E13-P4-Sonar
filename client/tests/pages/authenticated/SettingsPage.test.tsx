import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SettingsPage from "@/pages/authenticated/settingsPage";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import themeReducer from "@/store/slices/themeSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";
import uiReducer from "@/store/slices/uiSlice";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "es",
      changeLanguage: vi.fn(),
      options: { supportedLngs: ["es", "en"] },
      getResourceBundle: () => ({ language: { name: "Español", flag: "🇪🇸" } }),
    },
  }),
}));

vi.mock("@/components/shared/Typewriter", () => ({
  Typewriter: ({ text }: { text: string }) => <h1>{text}</h1>,
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({}),
  },
  apiErrorMessage: vi.fn(),
}));

describe("SettingsPage", () => {
  let store: ReturnType<typeof configureStore>;

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    isGoogleAuthUser: false,
    emailNotifications: true,
    pushNotifications: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
        theme: themeReducer,
        lists: listsReducer,
        tasks: tasksReducer,
        notifications: notificationsReducer,
        ui: uiReducer,
      },
      preloadedState: {
        auth: {
          user: mockUser,
          token: "token123",
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitializing: false,
        },
        theme: { theme: "light" },
        ui: { sidebarWidth: "normal", taskCardSize: 2 },
      },
    });
  });

  const renderPage = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      </Provider>,
    );
  };

  it("renders all settings sections", () => {
    renderPage();
    expect(screen.getByText("settings.title")).toBeInTheDocument();
    expect(screen.getByText("settings.profile.title")).toBeInTheDocument();
    expect(screen.getByText("settings.preferences.title")).toBeInTheDocument();
    expect(
      screen.getByText("settings.notifications.title"),
    ).toBeInTheDocument();
    expect(screen.getByText("settings.privacy.title")).toBeInTheDocument();
  });

  it("renders profile form with user data", () => {
    renderPage();
    const nameInput = screen.getByLabelText(/settings.profile.name/i);
    expect(nameInput).toHaveValue("Test User");
    const emailInput = screen.getByLabelText(/settings.profile.email/i);
    expect(emailInput).toBeDisabled();
    const saveButtons = screen.getAllByText("settings.profile.saveChanges");
    expect(saveButtons.length).toBeGreaterThan(0);
  });

  it("renders privacy and notification controls", () => {
    renderPage();
    expect(
      screen.getByText("settings.privacy.deleteAccount"),
    ).toBeInTheDocument();
    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBeGreaterThan(0);
  });
});
