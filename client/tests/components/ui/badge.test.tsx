import { Badge } from "@/components/ui/badge";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Badge", () => {
  it("Renderiza correctamente el componente Badge", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText(/new/i)).toBeInTheDocument();
  });

  it("Renderiza con la variante default", () => {
    render(<Badge variant="default">Default</Badge>);
    const badge = screen.getByText(/default/i);
    expect(badge).toBeInTheDocument();
  });

  it("Renderiza con la variante secondary", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText(/secondary/i);
    expect(badge).toBeInTheDocument();
  });

  it("Renderiza con la variante destructive", () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText(/error/i);
    expect(badge).toBeInTheDocument();
  });

  it("Renderiza con la variante outline", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText(/outline/i);
    expect(badge).toBeInTheDocument();
  });

  it("Aplica clases personalizadas", () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    const badge = screen.getByText(/custom/i);
    expect(badge).toHaveClass("custom-badge");
  });

  it("Renderiza con leftIcon (string)", () => {
    render(<Badge leftIcon="Star">Featured</Badge>);
    const badge = screen.getByText(/featured/i);
    expect(badge).toBeInTheDocument();
  });

  it("Renderiza con rightIcon (string)", () => {
    render(<Badge rightIcon="Check">Verified</Badge>);
    const badge = screen.getByText(/verified/i);
    expect(badge).toBeInTheDocument();
  });

  it("Renderiza con leftIcon y rightIcon simultáneamente", () => {
    render(
      <Badge leftIcon="Star" rightIcon="Check">
        Both Icons
      </Badge>,
    );
    const badge = screen.getByText(/both icons/i);
    expect(badge).toBeInTheDocument();
  });

  it("Renderiza con iconSize personalizado", () => {
    render(
      <Badge leftIcon="Heart" iconSize={20}>
        Custom Size
      </Badge>,
    );
    const badge = screen.getByText(/custom size/i);
    expect(badge).toBeInTheDocument();
  });

  it("Tiene el data-slot attribute", () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText(/test/i);
    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  it("Renderiza sin leftIcon cuando no se proporciona", () => {
    render(<Badge rightIcon="Check">Only Right</Badge>);
    const badge = screen.getByText(/only right/i);
    expect(badge).toBeInTheDocument();
  });

  it("Renderiza sin rightIcon cuando no se proporciona", () => {
    render(<Badge leftIcon="Star">Only Left</Badge>);
    const badge = screen.getByText(/only left/i);
    expect(badge).toBeInTheDocument();
  });

  it("Renderiza sin iconos cuando ninguno se proporciona", () => {
    render(<Badge>No Icons</Badge>);
    const badge = screen.getByText(/no icons/i);
    expect(badge).toBeInTheDocument();
  });

  it("Maneja props adicionales correctamente", () => {
    render(<Badge data-testid="test-badge">Test</Badge>);
    const badge = screen.getByTestId("test-badge");
    expect(badge).toBeInTheDocument();
  });

  it("Renderiza con múltiples variantes", () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText(/default/i)).toBeInTheDocument();

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText(/secondary/i)).toBeInTheDocument();

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText(/destructive/i)).toBeInTheDocument();

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText(/outline/i)).toBeInTheDocument();
  });

  it("Combina variante y clase personalizada", () => {
    render(
      <Badge variant="destructive" className="extra-class">
        Combined
      </Badge>,
    );
    const badge = screen.getByText(/combined/i);
    expect(badge).toHaveClass("extra-class");
  });

  it("Renderiza como span por defecto (no asChild)", () => {
    const { container } = render(<Badge>Span Badge</Badge>);
    const span = container.querySelector("span[data-slot='badge']");
    expect(span).toBeInTheDocument();
  });

  it("asChild por defecto es false", () => {
    const { container } = render(<Badge>Test</Badge>);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
  });

  it("Renderiza contenido de children correctamente", () => {
    render(
      <Badge>
        <span>Complex</span> Content
      </Badge>,
    );
    expect(screen.getByText(/complex/i)).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });
});
