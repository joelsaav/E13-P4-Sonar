import FeatureCard from "@/components/shared/FeatureCard";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("FeatureCard", () => {
  describe("Renderizado básico", () => {
    it("Renderiza título, descripción e icono correctamente", () => {
      render(
        <FeatureCard
          title="Test Title"
          description="Test Desc"
          icon="IconHeart"
          iconLabel="Favorito"
        />,
      );
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Desc")).toBeInTheDocument();
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("Maneja props opcionales faltantes (descripción, icono) sin errores", () => {
      const { container } = render(<FeatureCard title="Minimal" />);
      expect(screen.getByText("Minimal")).toBeInTheDocument();
      expect(container.querySelector(".text-xs.sm\\:text-sm")).toBeNull(); // No description
      expect(container.querySelector(".text-xl.shrink-0")).toBeNull(); // No icon
    });
  });

  describe("Details y Charts", () => {
    it("Renderiza bigDetails correctamente", () => {
      const { container } = render(
        <FeatureCard title="Title" bigDetails details="100" />,
      );
      expect(container.querySelector("#big-details")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(container.querySelector("#details")).toBeNull();
    });

    it("Renderiza details normales por defecto o explícitamente", () => {
      const { container } = render(
        <FeatureCard title="Title" bigDetails={false} details="Small text" />,
      );
      expect(container.querySelector("#details")).toBeInTheDocument();
      expect(screen.getByText("Small text")).toBeInTheDocument();
      expect(container.querySelector("#big-details")).toBeNull();
    });

    it("No renderiza details si no se proporcionan, o si chart=true", () => {
      const { container, rerender } = render(<FeatureCard title="Title" />);
      expect(container.querySelector("#big-details")).toBeNull();
      expect(container.querySelector("#details")).toBeNull();

      rerender(<FeatureCard title="Title" details="Test" chart />);
      expect(container.querySelector("#details")).toBeNull();
    });
  });

  describe("Children y Composición", () => {
    it("Renderiza children y combina con otros elementos", () => {
      render(
        <FeatureCard title="Title" bigDetails details="100">
          <div data-testid="child">Child content</div>
        </FeatureCard>,
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("No renderiza children si es null/false/vacío", () => {
      const { container } = render(
        <FeatureCard title="Title">{null}</FeatureCard>,
      );
      expect(container.querySelectorAll(".pt-0").length).toBe(0);
    });
  });

  describe("Casos borde y Props", () => {
    it("Acepta className personalizado", () => {
      const { container } = render(
        <FeatureCard title="Title" className="custom-class" />,
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("Maneja details con saltos de línea", () => {
      render(
        <FeatureCard
          title="Title"
          details="Line 1{'\n'}Line 2"
          chart={false}
        />,
      );
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    });

    it("Maneja props explícitamente null/false sin explotar", () => {
      const { container } = render(
        <FeatureCard
          title="Title"
          description={null as any}
          icon={null as any}
          children={false}
        />,
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(container.querySelector(".text-xs")).toBeNull();
    });
  });
});
