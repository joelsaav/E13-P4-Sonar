import Footer from "@/components/layout/Footer";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "footer.ariaLabel": "Site footer",
        "footer.rights": "All rights reserved",
        "footer.contact": "Contact",
      };
      return translations[key] || key;
    },
  }),
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders footer element", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("displays copyright year", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it("displays rights text", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });

  it("renders contact button", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: /contact/i }),
    ).toBeInTheDocument();
  });

  it("navigates to contacts page on contact button click", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const contactButton = screen.getByRole("button", { name: /contact/i });
    fireEvent.click(contactButton);

    expect(mockNavigate).toHaveBeenCalledWith("/contacts");
  });

  it("has correct aria-label", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Site footer")).toBeInTheDocument();
  });
});
