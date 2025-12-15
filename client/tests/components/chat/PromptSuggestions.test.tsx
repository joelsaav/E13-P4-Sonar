import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PromptSuggestions } from "@/components/chat/PromptSuggestions";

describe("PromptSuggestions", () => {
  const mockAppend = vi.fn();
  const suggestions = ["Suggestion 1", "Suggestion 2", "Suggestion 3"];

  it("debe renderizar el label", () => {
    render(
      <PromptSuggestions
        label="Test Label"
        append={mockAppend}
        suggestions={suggestions}
      />,
    );
    expect(screen.getByText("Test Label")).toBeDefined();
  });

  it("debe renderizar todas las sugerencias", () => {
    render(
      <PromptSuggestions
        label="Test"
        append={mockAppend}
        suggestions={suggestions}
      />,
    );

    expect(screen.getByText("Suggestion 1")).toBeDefined();
    expect(screen.getByText("Suggestion 2")).toBeDefined();
    expect(screen.getByText("Suggestion 3")).toBeDefined();
  });

  it("debe llamar append con el contenido correcto al hacer click", async () => {
    const user = userEvent.setup();
    render(
      <PromptSuggestions
        label="Test"
        append={mockAppend}
        suggestions={suggestions}
      />,
    );

    const button = screen.getByText("Suggestion 1");
    await user.click(button);

    expect(mockAppend).toHaveBeenCalledWith({
      role: "user",
      content: "Suggestion 1",
    });
  });

  it("debe renderizar múltiples botones", () => {
    render(
      <PromptSuggestions
        label="Test"
        append={mockAppend}
        suggestions={suggestions}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
  });

  it("debe manejar lista vacía de sugerencias", () => {
    const { container } = render(
      <PromptSuggestions label="Test" append={mockAppend} suggestions={[]} />,
    );

    expect(screen.getByText("Test")).toBeDefined();
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(0);
  });
});
