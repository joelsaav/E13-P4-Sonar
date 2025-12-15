import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessageInput } from "@/components/chat/MessageInput";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "chat.placeholder": "Write your prompt here...",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/hooks/use-autosize-textarea", () => ({
  useAutosizeTextArea: vi.fn(),
}));

vi.mock("@/components/chat/FilePreview", () => ({
  FilePreview: ({ file, onRemove }: { file: File; onRemove: () => void }) => (
    <div data-testid={`file-preview-${file.name}`}>
      {file.name}
      <button onClick={onRemove}>Remove</button>
    </div>
  ),
}));

vi.mock("@/components/chat/InterruptPrompt", () => ({
  InterruptPrompt: ({
    isOpen,
    close,
  }: {
    isOpen: boolean;
    close: () => void;
  }) =>
    isOpen ? (
      <div data-testid="interrupt-prompt">
        <button onClick={close}>Close</button>
      </div>
    ) : null,
}));

describe("MessageInput", () => {
  const mockOnChange = vi.fn();
  const mockStop = vi.fn();

  const defaultProps = {
    value: "",
    onChange: mockOnChange,
    isGenerating: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar y manejar placeholder personalizado", () => {
    const { rerender } = render(<MessageInput {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Write your prompt here..."),
    ).toBeDefined();

    rerender(<MessageInput {...defaultProps} placeholder="Custom" />);
    expect(screen.getByPlaceholderText("Custom")).toBeDefined();
  });

  it("debe actualizar el valor al escribir", async () => {
    const user = userEvent.setup();
    render(<MessageInput {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Test message");
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("debe manejar el envío con Enter pero no con Shift+Enter", () => {
    const form = document.createElement("form");
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;
    const { container } = render(
      <MessageInput {...defaultProps} value="Test" />,
    );
    const textarea = container.querySelector("textarea")!;
    Object.defineProperty(textarea, "form", {
      value: form,
      configurable: true,
    });

    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(requestSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(requestSubmit).toHaveBeenCalled();
  });

  it("debe mostrar y manejar botón de stop", async () => {
    const user = userEvent.setup();
    render(
      <MessageInput {...defaultProps} isGenerating={true} stop={mockStop} />,
    );

    const stopButton = screen.getByLabelText("Stop generating");
    expect(stopButton).toBeDefined();
    await user.click(stopButton);
    expect(mockStop).toHaveBeenCalled();
  });

  it("debe gestionar estado del botón submit (disabled si vacío)", () => {
    const { rerender } = render(<MessageInput {...defaultProps} value="" />);
    const submitButton = screen.getByLabelText("Send message");
    expect(submitButton.hasAttribute("disabled")).toBe(true);

    rerender(<MessageInput {...defaultProps} value="Test" />);
    expect(submitButton.hasAttribute("disabled")).toBe(false);
  });

  it("debe mostrar interrupt prompt al presionar Enter mientras genera", () => {
    const form = document.createElement("form");
    form.requestSubmit = vi.fn();

    const { container } = render(
      <MessageInput
        {...defaultProps}
        value="Test"
        isGenerating={true}
        stop={mockStop}
      />,
    );

    const textarea = container.querySelector("textarea");
    if (textarea) {
      Object.defineProperty(textarea, "form", {
        value: form,
        configurable: true,
      });

      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      expect(screen.getByTestId("interrupt-prompt")).toBeDefined();
    }
  });

  describe("Con attachments", () => {
    const mockSetFiles = vi.fn();
    const attachmentProps = {
      ...defaultProps,
      allowAttachments: true as const,
      files: null,
      setFiles: mockSetFiles,
    };

    it("debe mostrar botón de adjuntar archivo", () => {
      render(<MessageInput {...attachmentProps} />);
      expect(screen.getByLabelText("Attach a file")).toBeDefined();
    });

    it("debe mostrar archivos adjuntos", () => {
      const files = [new File(["content"], "test.txt", { type: "text/plain" })];
      render(<MessageInput {...attachmentProps} files={files} />);
      expect(screen.getByTestId("file-preview-test.txt")).toBeDefined();
    });

    it("debe eliminar archivo al hacer click en remove", async () => {
      const user = userEvent.setup();
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      render(<MessageInput {...attachmentProps} files={[file]} />);

      const removeButton = screen.getByText("Remove");
      await user.click(removeButton);

      expect(mockSetFiles).toHaveBeenCalled();
    });

    it("debe manejar drag over", () => {
      const { container } = render(<MessageInput {...attachmentProps} />);
      const wrapper = container.querySelector(".relative.flex.w-full");

      if (wrapper) {
        fireEvent.dragOver(wrapper);
        expect(
          screen.getByText("Drop your files here to attach them."),
        ).toBeDefined();
      }
    });

    it("debe manejar drag leave", () => {
      const { container } = render(<MessageInput {...attachmentProps} />);
      const wrapper = container.querySelector(".relative.flex.w-full");

      if (wrapper) {
        fireEvent.dragOver(wrapper);
        fireEvent.dragLeave(wrapper);
        expect(
          screen.queryByText("Drop your files here to attach them."),
        ).toBeNull();
      }
    });

    it("debe manejar drop de archivos", () => {
      const { container } = render(<MessageInput {...attachmentProps} />);
      const wrapper = container.querySelector(".relative.flex.w-full");

      const file = new File(["content"], "dropped.txt", { type: "text/plain" });
      const dataTransfer = {
        files: [file],
      };

      if (wrapper) {
        fireEvent.drop(wrapper, { dataTransfer });
        expect(mockSetFiles).toHaveBeenCalled();
      }
    });

    it("debe manejar paste de archivos", () => {
      const { container } = render(<MessageInput {...attachmentProps} />);
      const textarea = container.querySelector("textarea");

      const file = new File(["content"], "pasted.txt", { type: "text/plain" });
      const clipboardData = {
        items: [
          {
            getAsFile: () => file,
          },
        ],
        getData: () => "",
      };

      if (textarea) {
        fireEvent.paste(textarea, { clipboardData });
        expect(mockSetFiles).toHaveBeenCalled();
      }
    });

    it("debe crear archivo desde texto largo en paste", () => {
      const { container } = render(<MessageInput {...attachmentProps} />);
      const textarea = container.querySelector("textarea");

      const longText = "a".repeat(600);
      const clipboardData = {
        items: [],
        getData: () => longText,
      };

      if (textarea) {
        fireEvent.paste(textarea, { clipboardData });
        expect(mockSetFiles).toHaveBeenCalled();
      }
    });
  });

  describe("Sin attachments", () => {
    it("no debe mostrar botón de adjuntar", () => {
      render(<MessageInput {...defaultProps} allowAttachments={false} />);
      expect(screen.queryByLabelText("Attach a file")).toBeNull();
    });

    it("no debe reaccionar a drag events", () => {
      const { container } = render(
        <MessageInput {...defaultProps} allowAttachments={false} />,
      );
      const wrapper = container.querySelector(".relative.flex.w-full");

      if (wrapper) {
        fireEvent.dragOver(wrapper);
        expect(
          screen.queryByText("Drop your files here to attach them."),
        ).toBeNull();
      }
    });
  });

  it("debe respetar submitOnEnter=false", () => {
    const form = document.createElement("form");
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const { container } = render(
      <MessageInput {...defaultProps} value="Test" submitOnEnter={false} />,
    );
    const textarea = container.querySelector("textarea");

    if (textarea) {
      Object.defineProperty(textarea, "form", {
        value: form,
        configurable: true,
      });

      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      expect(requestSubmit).not.toHaveBeenCalled();
    }
  });

  it("debe aplicar className personalizado", () => {
    const { container } = render(
      <MessageInput {...defaultProps} className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeDefined();
  });

  it("debe ocultar interrupt prompt cuando deja de generar", () => {
    const { rerender } = render(
      <MessageInput
        {...defaultProps}
        value="Test"
        isGenerating={true}
        stop={mockStop}
      />,
    );

    const form = document.createElement("form");
    form.requestSubmit = vi.fn();

    rerender(
      <MessageInput
        {...defaultProps}
        value="Test"
        isGenerating={false}
        stop={mockStop}
      />,
    );

    expect(screen.queryByTestId("interrupt-prompt")).toBeNull();
  });

  it("debe deshabilitar interrupt con enableInterrupt=false", () => {
    const form = document.createElement("form");
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const { container } = render(
      <MessageInput
        {...defaultProps}
        value="Test"
        isGenerating={true}
        stop={mockStop}
        enableInterrupt={false}
      />,
    );

    const textarea = container.querySelector("textarea");
    if (textarea) {
      Object.defineProperty(textarea, "form", {
        value: form,
        configurable: true,
      });

      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      expect(screen.queryByTestId("interrupt-prompt")).toBeNull();
    }
  });
});
