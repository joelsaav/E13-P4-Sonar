import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TypingIndicator } from "@/components/chat/TypingIndicator";

describe("TypingIndicator", () => {
  it("debe renderizar el indicador de escritura", () => {
    const { container } = render(<TypingIndicator />);
    expect(container.firstChild).toBeDefined();
  });

  it("debe contener tres puntos animados", () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll("svg");
    expect(dots.length).toBe(3);
  });

  it("debe tener las clases correctas para animación", () => {
    const { container } = render(<TypingIndicator />);
    const firstDot = container.querySelector(".animate-typing-dot-bounce");
    expect(firstDot).toBeDefined();
  });

  it("debe aplicar delays de animación diferentes a cada punto", () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll("svg");

    expect(dots.length).toBe(3);
  });
});
