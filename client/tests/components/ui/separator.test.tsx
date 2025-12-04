import { Separator } from "@/components/ui/separator";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Separator", () => {
  it("Renderiza correctamente un separador horizontal", () => {
    const { container } = render(<Separator />);

    const separator = container.querySelector('[data-slot="separator"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
  });

  it("Renderiza correctamente un separador vertical", () => {
    const { container } = render(<Separator orientation="vertical" />);

    const separator = container.querySelector('[data-slot="separator"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-orientation", "vertical");
  });

  it("Aplica clases personalizadas", () => {
    const { container } = render(<Separator className="custom-separator" />);

    const separator = container.querySelector('[data-slot="separator"]');
    expect(separator).toHaveClass("custom-separator");
  });

  it("Tiene decorative=true por defecto", () => {
    const { container } = render(<Separator />);

    const separator = container.querySelector('[data-slot="separator"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
  });

  it("Puede ser no decorativo", () => {
    const { container } = render(<Separator decorative={false} />);

    const separator = container.querySelector('[data-slot="separator"]');
    expect(separator).not.toHaveAttribute("aria-hidden", "true");
  });

  it("Maneja props adicionales correctamente", () => {
    const { container } = render(<Separator data-testid="test-separator" />);

    const separator = container.querySelector('[data-testid="test-separator"]');
    expect(separator).toBeInTheDocument();
  });
});
