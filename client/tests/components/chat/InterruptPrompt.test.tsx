import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InterruptPrompt } from "@/components/chat/InterruptPrompt";

describe("InterruptPrompt", () => {
  it("debe renderizar cuando isOpen es true", () => {
    render(<InterruptPrompt isOpen={true} close={vi.fn()} />);
    expect(screen.getByText(/press enter again to interrupt/i)).toBeDefined();
  });

  it("no debe renderizar cuando isOpen es false", () => {
    const { container } = render(
      <InterruptPrompt isOpen={false} close={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe llamar close cuando se hace click en el botón de cerrar", async () => {
    const mockClose = vi.fn();
    const user = userEvent.setup();

    render(<InterruptPrompt isOpen={true} close={mockClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("debe mostrar el icono X", () => {
    render(<InterruptPrompt isOpen={true} close={vi.fn()} />);
    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeDefined();
  });

  it("debe contener el texto correcto", () => {
    render(<InterruptPrompt isOpen={true} close={vi.fn()} />);
    const text = screen.getByText("Press Enter again to interrupt");
    expect(text).toBeDefined();
  });
});
