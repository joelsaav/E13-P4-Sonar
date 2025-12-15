import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { Chat } from "@/components/chat/Chat";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/chatBot/useAutoScroll", () => ({
  useAutoScroll: () => ({
    containerRef: { current: null },
    scrollToBottom: vi.fn(),
    handleScroll: vi.fn(),
    shouldAutoScroll: true,
    handleTouchStart: vi.fn(),
  }),
}));

let capturedStopFn: (() => void) | undefined;

vi.mock("@/components/chat/MessageList", () => ({
  MessageList: ({
    messages,
    messageOptions,
  }: {
    messages: Array<{ id: string; content: string }>;
    messageOptions?: (msg: any) => { actions: React.ReactNode };
  }) => (
    <div data-testid="message-list">
      {messages.map((m) => (
        <div key={m.id}>
          {m.content}
          {messageOptions && (
            <div data-testid={`actions-${m.id}`}>
              {messageOptions(m).actions}
            </div>
          )}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/chat/MessageInput", () => ({
  MessageInput: ({
    value,
    stop,
    isGenerating,
  }: {
    value: string;
    onChange?: () => void;
    onSubmit?: () => void;
    stop?: () => void;
    isGenerating?: boolean;
  }) => {
    capturedStopFn = stop;
    return (
      <div>
        <textarea data-testid="message-input" value={value} readOnly />
        {isGenerating && stop && (
          <button data-testid="stop-button" onClick={stop}>
            Stop
          </button>
        )}
      </div>
    );
  },
}));

vi.mock("@/components/chat/PromptSuggestions", () => ({
  PromptSuggestions: ({
    suggestions,
    append,
  }: {
    suggestions: string[];
    append: (msg: { role: string; content: string }) => void;
  }) => (
    <div data-testid="prompt-suggestions">
      {suggestions.map((s: string) => (
        <button key={s} onClick={() => append({ role: "user", content: s })}>
          {s}
        </button>
      ))}
    </div>
  ),
}));

describe("Chat", () => {
  const defaultProps = {
    messages: [],
    handleSubmit: vi.fn(),
    input: "",
    handleInputChange: vi.fn(),
    isGenerating: false,
  };

  beforeEach(() => {
    capturedStopFn = undefined;
  });

  it("renders with messages and input", () => {
    const messages = [
      {
        id: "1",
        role: "user" as const,
        content: "Hello",
        createdAt: new Date(),
      },
      {
        id: "2",
        role: "assistant" as const,
        content: "Hi",
        createdAt: new Date(),
      },
    ];
    render(<Chat {...defaultProps} messages={messages} />);
    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("Hi")).toBeDefined();
  });

  it("renders suggestions when provided", () => {
    const props = {
      ...defaultProps,
      append: vi.fn(),
      suggestions: ["Suggestion 1", "Suggestion 2"],
    };
    render(<Chat {...props} />);
    expect(screen.getByTestId("prompt-suggestions")).toBeDefined();
  });

  it("triggers handleStop when stop button clicked with toolInvocations in call state", () => {
    const setMessages = vi.fn();
    const stopFn = vi.fn();
    const messages = [
      {
        id: "1",
        role: "assistant" as const,
        content: "",
        toolInvocations: [{ state: "call" as const, toolName: "test" }],
        createdAt: new Date(),
      },
    ];
    render(
      <Chat
        {...defaultProps}
        messages={messages}
        setMessages={setMessages}
        stop={stopFn}
        isGenerating={true}
      />,
    );

    const stopButton = screen.getByTestId("stop-button");
    fireEvent.click(stopButton);

    expect(stopFn).toHaveBeenCalled();
    expect(setMessages).toHaveBeenCalled();
  });

  it("triggers handleStop with parts containing tool-invocation in call state", () => {
    const setMessages = vi.fn();
    const stopFn = vi.fn();
    const messages = [
      {
        id: "1",
        role: "assistant" as const,
        content: "",
        parts: [
          {
            type: "tool-invocation" as const,
            toolInvocation: { state: "call" as const, toolName: "test" },
          },
        ],
        createdAt: new Date(),
      },
    ];
    render(
      <Chat
        {...defaultProps}
        messages={messages}
        setMessages={setMessages}
        stop={stopFn}
        isGenerating={true}
      />,
    );

    const stopButton = screen.getByTestId("stop-button");
    fireEvent.click(stopButton);

    expect(stopFn).toHaveBeenCalled();
    expect(setMessages).toHaveBeenCalled();
  });

  it("calls handleStop without updating when no assistant message", () => {
    const setMessages = vi.fn();
    const stopFn = vi.fn();
    const messages = [
      {
        id: "1",
        role: "user" as const,
        content: "Hello",
        createdAt: new Date(),
      },
    ];
    render(
      <Chat
        {...defaultProps}
        messages={messages}
        setMessages={setMessages}
        stop={stopFn}
        isGenerating={true}
      />,
    );

    const stopButton = screen.getByTestId("stop-button");
    fireEvent.click(stopButton);

    expect(stopFn).toHaveBeenCalled();
    expect(setMessages).not.toHaveBeenCalled();
  });

  it("renders rating buttons when onRateResponse is provided", () => {
    const onRateResponse = vi.fn();
    const messages = [
      {
        id: "1",
        role: "assistant" as const,
        content: "Response",
        createdAt: new Date(),
      },
    ];
    render(
      <Chat
        {...defaultProps}
        messages={messages}
        onRateResponse={onRateResponse}
      />,
    );
    expect(screen.getByTestId("actions-1")).toBeDefined();
  });
});
