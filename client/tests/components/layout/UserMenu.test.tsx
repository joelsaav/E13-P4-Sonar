import UserMenu from "@/components/layout/UserMenu";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "auth.myAccount": "My Account",
        "auth.profile": "Profile",
        "nav.settings": "Settings",
        "auth.logout": "Logout",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("@/components/layout/LanguageSelector", () => ({
  default: () => <div data-testid="language-selector">Language Selector</div>,
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(() => render(<UserMenu />)).not.toThrow();
  });

  it("renders avatar with default initial", () => {
    render(<UserMenu />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders avatar with custom initial", () => {
    render(<UserMenu userInitial="J" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("renders dropdown trigger button", () => {
    render(<UserMenu />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
  });

  it("accepts all props without errors", () => {
    const mockFn = vi.fn();
    expect(() =>
      render(
        <UserMenu
          onProfile={mockFn}
          onSettings={mockFn}
          onLogout={mockFn}
          userName="John"
          userEmail="john@example.com"
          userInitial="J"
          userImage="https://example.com/image.jpg"
        />,
      ),
    ).not.toThrow();
  });

  it("renders with user image prop", () => {
    render(<UserMenu userImage="https://example.com/avatar.jpg" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders with all optional props", () => {
    render(
      <UserMenu
        userName="Test User"
        userEmail="test@example.com"
        userInitial="T"
      />,
    );
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});
