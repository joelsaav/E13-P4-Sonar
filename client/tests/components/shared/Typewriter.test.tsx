import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Typewriter } from "@/components/shared/Typewriter";
import { I18nTestProvider } from "../../helpers/i18nTestProvider";

describe("Typewriter", () => {
  it("renders with text", () => {
    render(
      <I18nTestProvider>
        <Typewriter text="Hello World" />
      </I18nTestProvider>,
    );

    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <I18nTestProvider>
        <Typewriter text="Test" className="custom-class" />
      </I18nTestProvider>,
    );

    expect(screen.getByRole("heading")).toHaveClass("custom-class");
  });

  it("renders with cursor when showCursor is true", () => {
    render(
      <I18nTestProvider>
        <Typewriter text="Test" showCursor={true} />
      </I18nTestProvider>,
    );

    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
  });
});
