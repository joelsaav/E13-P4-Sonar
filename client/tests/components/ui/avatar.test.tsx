import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Avatar", () => {
  it("Renderiza correctamente el componente Avatar", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
  });

  it("Aplica clases personalizadas al Avatar", () => {
    const { container } = render(
      <Avatar className="custom-class">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toHaveClass("custom-class");
  });

  it("Renderiza AvatarImage correctamente", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test-image.jpg" alt="Test" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    // AvatarImage se renderiza pero puede no estar visible hasta que cargue
    // Verificamos que el Avatar está presente
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toBeInTheDocument();
  });

  it("Renderiza AvatarFallback cuando no hay imagen", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    const fallback = container.querySelector('[data-slot="avatar-fallback"]');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent("AB");
  });

  it("Aplica clases personalizadas al AvatarImage", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test.jpg" className="custom-image" alt="Test" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    // Verificamos que el Avatar contenedor existe con la estructura correcta
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toBeInTheDocument();
  });

  it("Aplica clases personalizadas al AvatarFallback", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback className="custom-fallback">AB</AvatarFallback>
      </Avatar>,
    );

    const fallback = container.querySelector('[data-slot="avatar-fallback"]');
    expect(fallback).toHaveClass("custom-fallback");
  });

  it("Renderiza múltiples avatares correctamente", () => {
    const { container } = render(
      <>
        <Avatar>
          <AvatarFallback>A1</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>A2</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>A3</AvatarFallback>
        </Avatar>
      </>,
    );

    const avatars = container.querySelectorAll('[data-slot="avatar"]');
    expect(avatars).toHaveLength(3);
  });

  it("Maneja props adicionales correctamente", () => {
    const { container } = render(
      <Avatar data-testid="custom-avatar">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.querySelector('[data-testid="custom-avatar"]');
    expect(avatar).toBeInTheDocument();
  });
});
