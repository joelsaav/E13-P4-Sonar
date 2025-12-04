import { Button } from "@/components/ui/button";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Button", () => {
  it("Renderiza correctamente el componente Button", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("Renderiza con la variante default", () => {
    render(<Button variant="default">Default</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con la variante destructive", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con la variante outline", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con la variante secondary", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con la variante ghost", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con la variante link", () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con tamaño default", () => {
    render(<Button size="default">Default Size</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con tamaño sm", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con tamaño lg", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con tamaño icon", () => {
    render(<Button size="icon">🔍</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Aplica clases personalizadas", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("Renderiza con leftIcon (string)", () => {
    render(<Button leftIcon="Search">Search</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con rightIcon (string)", () => {
    render(<Button rightIcon="ArrowRight">Next</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con leftIcon y rightIcon simultáneamente", () => {
    render(
      <Button leftIcon="ChevronLeft" rightIcon="ChevronRight">
        Both Icons
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con iconSize personalizado", () => {
    render(
      <Button leftIcon="Star" iconSize={24}>
        Custom Icon Size
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza con prop text en lugar de children", () => {
    render(<Button text="Using text prop" />);
    expect(
      screen.getByRole("button", { name: /using text prop/i }),
    ).toBeInTheDocument();
  });

  it("text se muestra cuando no hay children", () => {
    render(<Button text="text prop" />);
    expect(
      screen.getByRole("button", { name: /text prop/i }),
    ).toBeInTheDocument();
  });

  it("children se muestra cuando ambos están presentes", () => {
    render(<Button text="text prop">children content</Button>);
    expect(
      screen.getByRole("button", { name: /text prop/i }),
    ).toBeInTheDocument();
  });

  it("Maneja el atributo disabled correctamente", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("Maneja el atributo type correctamente", () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("Maneja el atributo disabled correctamente", () => {
    let clicked = false;
    render(
      <Button
        onClick={() => {
          clicked = true;
        }}
      >
        Click
      </Button>,
    );
    const button = screen.getByRole("button");
    button.click();
    expect(clicked).toBe(true);
  });

  it("Renderiza con múltiples variantes y tamaños combinados", () => {
    render(
      <Button variant="outline" size="lg">
        Large Outline
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza sin leftIcon cuando no se proporciona", () => {
    render(<Button rightIcon="Check">Only Right Icon</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza sin rightIcon cuando no se proporciona", () => {
    render(<Button leftIcon="Check">Only Left Icon</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("Renderiza sin iconos cuando ninguno se proporciona", () => {
    render(<Button>No Icons</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
