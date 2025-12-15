import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LandingPage from "@/pages/public/landingPage";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/shared/Typewriter", () => ({
  Typewriter: ({ text }: { text: string }) => <h1>{text}</h1>,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

vi.mock("@/components/shared/FeatureCard", () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock("@/config/landingCards", () => ({
  landingCards: [
    {
      icon: "IconCheck",
      title: "feature.title",
      description: "feature.description",
      details: "feature.details",
    },
  ],
}));

describe("LandingPage", () => {
  const renderPage = () => {
    return render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
  };

  it("renders hero section with navigation", () => {
    renderPage();
    expect(screen.getByText(/landing.welcome/)).toBeInTheDocument();
    expect(screen.getByText("landing.subtitle")).toBeInTheDocument();
    expect(screen.getByText("auth.register")).toBeInTheDocument();
    expect(screen.getByText("auth.login")).toBeInTheDocument();
  });

  it("renders features and CTA sections", () => {
    renderPage();
    expect(screen.getByText("landing.features.title")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card")).toBeInTheDocument();
    expect(screen.getByText("landing.cta.title")).toBeInTheDocument();
  });
});
