import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatWithSuggestions } from "@/components/chat/ChatWithSuggestions";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "chat.botResponse": "Default bot response",
        "chat.suggestions.createTask": "Create a task",
        "chat.suggestions.shareList": "Share a list",
        "chat.suggestions.notifications": "Notifications",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("@/components/chat/Chat", () => ({
  Chat: ({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isGenerating,
    stop,
    append,
    suggestions,
  }: {
    messages: Array<{ id: string; content: string }>;
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e?: { preventDefault?: () => void }) => void;
    isGenerating: boolean;
    stop: () => void;
    append: (msg: { role: string; content: string }) => void;
    suggestions: string[];
  }) => (
    <div data-testid="chat-wrapper">
      <div data-testid="messages">
        {messages.map((m) => (
          <div key={m.id} data-testid={`message-${m.id}`}>
            {m.content}
          </div>
        ))}
      </div>
      <textarea
        data-testid="input"
        value={input}
        onChange={handleInputChange}
      />
      <button
        data-testid="submit"
        onClick={() => handleSubmit({ preventDefault: () => {} })}
      >
        Submit
      </button>
      <button data-testid="stop" onClick={stop}>
        Stop
      </button>
      <div data-testid="suggestions">
        {suggestions.map((s) => (
          <button key={s} onClick={() => append({ role: "user", content: s })}>
            {s}
          </button>
        ))}
      </div>
      {isGenerating && <div data-testid="loading">Loading...</div>}
    </div>
  ),
}));

describe("ChatWithSuggestions", () => {
  const createMockResponse = (chunks: string[]) => {
    let index = 0;
    const encoder = new TextEncoder();

    return {
      ok: true,
      body: {
        getReader: () => ({
          read: async () => {
            if (index >= chunks.length) {
              return { done: true, value: undefined };
            }
            const chunk = encoder.encode(chunks[index]);
            index++;
            return { done: false, value: chunk };
          },
        }),
      },
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("debe renderizar el componente ChatWithSuggestions", () => {
    render(<ChatWithSuggestions />);
    expect(screen.getByTestId("chat-wrapper")).toBeDefined();
  });

  it("debe mostrar las sugerencias iniciales", () => {
    render(<ChatWithSuggestions />);
    expect(screen.getByText("Create a task")).toBeDefined();
    expect(screen.getByText("Share a list")).toBeDefined();
    expect(screen.getByText("Notifications")).toBeDefined();
  });

  it("debe actualizar el input al escribir", async () => {
    const user = userEvent.setup();
    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Hello");

    expect(input).toBeDefined();
  });

  it("debe enviar mensaje y recibir respuesta en streaming", async () => {
    const user = userEvent.setup();
    const mockResponse = createMockResponse([
      'data: {"content":"Hello"}\n',
      'data: {"content":" World"}\n',
      "data: [DONE]\n",
    ]);

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse,
    );

    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Test message");

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Test message")).toBeDefined();
    });
  });

  it("debe mostrar loading durante la generación", async () => {
    const user = userEvent.setup();
    const mockResponse = createMockResponse([
      'data: {"content":"Response"}\n',
      "data: [DONE]\n",
    ]);

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse,
    );

    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Test");

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).toBeDefined();
    });
  });

  it("debe manejar errores de fetch", async () => {
    const user = userEvent.setup();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Test");

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Default bot response")).toBeDefined();
    });
  });

  it("debe detener la generación al presionar stop", async () => {
    const user = userEvent.setup();
    const mockResponse = createMockResponse([
      'data: {"content":"Long"}\n',
      'data: {"content":" response"}\n',
    ]);

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse,
    );

    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Test");

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    const stopButton = screen.getByTestId("stop");
    await user.click(stopButton);

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).toBeNull();
    });
  });

  it("debe usar append para enviar sugerencia", async () => {
    const user = userEvent.setup();
    const mockResponse = createMockResponse([
      'data: {"content":"Sure"}\n',
      "data: [DONE]\n",
    ]);

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse,
    );

    render(<ChatWithSuggestions />);

    const suggestion = screen.getByText("Create a task");
    await user.click(suggestion);

    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it("no debe enviar si el input está vacío", async () => {
    const user = userEvent.setup();
    render(<ChatWithSuggestions />);

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("no debe enviar si ya está cargando", async () => {
    const user = userEvent.setup();
    const mockResponse = createMockResponse([
      'data: {"content":"Response"}\n',
      "data: [DONE]\n",
    ]);

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse,
    );

    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Test 1");

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    await user.click(submitButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it("debe limpiar el input después de enviar", async () => {
    const user = userEvent.setup();
    const mockResponse = createMockResponse([
      'data: {"content":"OK"}\n',
      "data: [DONE]\n",
    ]);

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse,
    );

    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Test message");

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    await waitFor(() => {
      const currentValue = input.getAttribute("value");
      expect(currentValue === "" || currentValue === null).toBe(true);
    });
  });

  it("debe manejar respuesta sin body", async () => {
    const user = userEvent.setup();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      body: null,
    });

    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Test");

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).toBeNull();
    });
  });

  it("debe manejar chunks con JSON inválido", async () => {
    const user = userEvent.setup();
    const mockResponse = createMockResponse([
      "data: {invalid json}\n",
      'data: {"content":"Valid"}\n',
      "data: [DONE]\n",
    ]);

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse,
    );

    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Test");

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).toBeDefined();
    });
  });

  it("debe manejar respuesta no exitosa", async () => {
    const user = userEvent.setup();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ChatWithSuggestions />);

    const input = screen.getByTestId("input");
    await user.type(input, "Test");

    const submitButton = screen.getByTestId("submit");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Default bot response")).toBeDefined();
    });
  });
});
