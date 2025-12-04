import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Card", () => {
  it("Renderiza correctamente el componente Card", () => {
    const { container } = render(<Card>Contenido</Card>);

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent("Contenido");
  });

  it("Aplica clases personalizadas al Card", () => {
    const { container } = render(
      <Card className="custom-class">Contenido</Card>,
    );

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toHaveClass("custom-class");
  });

  it("Renderiza CardHeader correctamente", () => {
    const { container } = render(<CardHeader>Header</CardHeader>);

    const header = container.querySelector('[data-slot="card-header"]');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent("Header");
  });

  it("Aplica clases personalizadas al CardHeader", () => {
    const { container } = render(
      <CardHeader className="custom-header">Header</CardHeader>,
    );

    const header = container.querySelector('[data-slot="card-header"]');
    expect(header).toHaveClass("custom-header");
  });

  it("Renderiza CardTitle correctamente", () => {
    const { container } = render(<CardTitle>Título</CardTitle>);

    const title = container.querySelector('[data-slot="card-title"]');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Título");
  });

  it("Aplica clases personalizadas al CardTitle", () => {
    const { container } = render(
      <CardTitle className="custom-title">Título</CardTitle>,
    );

    const title = container.querySelector('[data-slot="card-title"]');
    expect(title).toHaveClass("custom-title");
  });

  it("Renderiza CardDescription correctamente", () => {
    const { container } = render(
      <CardDescription>Descripción</CardDescription>,
    );

    const description = container.querySelector(
      '[data-slot="card-description"]',
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("Descripción");
  });

  it("Aplica clases personalizadas al CardDescription", () => {
    const { container } = render(
      <CardDescription className="custom-desc">Descripción</CardDescription>,
    );

    const description = container.querySelector(
      '[data-slot="card-description"]',
    );
    expect(description).toHaveClass("custom-desc");
  });

  it("Renderiza CardAction correctamente", () => {
    const { container } = render(<CardAction>Acción</CardAction>);

    const action = container.querySelector('[data-slot="card-action"]');
    expect(action).toBeInTheDocument();
    expect(action).toHaveTextContent("Acción");
  });

  it("Aplica clases personalizadas al CardAction", () => {
    const { container } = render(
      <CardAction className="custom-action">Acción</CardAction>,
    );

    const action = container.querySelector('[data-slot="card-action"]');
    expect(action).toHaveClass("custom-action");
  });

  it("Renderiza CardContent correctamente", () => {
    const { container } = render(<CardContent>Contenido</CardContent>);

    const content = container.querySelector('[data-slot="card-content"]');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Contenido");
  });

  it("Aplica clases personalizadas al CardContent", () => {
    const { container } = render(
      <CardContent className="custom-content">Contenido</CardContent>,
    );

    const content = container.querySelector('[data-slot="card-content"]');
    expect(content).toHaveClass("custom-content");
  });

  it("Renderiza CardFooter correctamente", () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);

    const footer = container.querySelector('[data-slot="card-footer"]');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent("Footer");
  });

  it("Aplica clases personalizadas al CardFooter", () => {
    const { container } = render(
      <CardFooter className="custom-footer">Footer</CardFooter>,
    );

    const footer = container.querySelector('[data-slot="card-footer"]');
    expect(footer).toHaveClass("custom-footer");
  });

  it("Renderiza una tarjeta completa con todos los componentes", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Título de la tarjeta</CardTitle>
          <CardDescription>Descripción de la tarjeta</CardDescription>
          <CardAction>
            <button>Acción</button>
          </CardAction>
        </CardHeader>
        <CardContent>Contenido principal</CardContent>
        <CardFooter>
          <button>Confirmar</button>
        </CardFooter>
      </Card>,
    );

    expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="card-header"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="card-title"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="card-description"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="card-action"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="card-content"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="card-footer"]'),
    ).toBeInTheDocument();
  });

  it("Maneja props adicionales correctamente", () => {
    const { container } = render(
      <Card data-testid="test-card">Contenido</Card>,
    );

    const card = container.querySelector('[data-testid="test-card"]');
    expect(card).toBeInTheDocument();
  });
});
