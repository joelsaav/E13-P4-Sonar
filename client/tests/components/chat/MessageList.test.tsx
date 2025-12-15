import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Message } from "@/components/chat/ChatMessage";
import { MessageList } from "@/components/chat/MessageList";

vi.mock("@/components/chat/ChatMessage", () => ({
  ChatMessage: ({ content }: { content: string }) => <div>{content}</div>,
}));

vi.mock("@/components/chat/TypingIndicator", () => ({
  TypingIndicator: () => <div>Typing...</div>,
}));

describe("MessageList", () => {
  const mockMessages: Message[] = [
    {
      role: "user",
      content: "Hello",
      id: "1",
      createdAt: new Date(),
    },
    {
      role: "assistant",
      content: "Hi there!",
      id: "2",
      createdAt: new Date(),
    },
  ];

  it("debe renderizar la lista de mensajes", () => {
    render(<MessageList messages={mockMessages} />);
    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("Hi there!")).toBeDefined();
  });

  it("debe mostrar el indicador de escritura cuando isTyping es true", () => {
    render(<MessageList messages={mockMessages} isTyping={true} />);
    expect(screen.getByText("Typing...")).toBeDefined();
  });

  it("no debe mostrar el indicador de escritura cuando isTyping es false", () => {
    render(<MessageList messages={mockMessages} isTyping={false} />);
    expect(screen.queryByText("Typing...")).toBeNull();
  });

  it("debe renderizar sin mensajes", () => {
    const { container } = render(<MessageList messages={[]} />);
    expect(container.querySelector(".space-y-4")).toBeDefined();
  });

  it("debe pasar showTimeStamps a ChatMessage", () => {
    render(<MessageList messages={mockMessages} showTimeStamps={false} />);
    expect(screen.getByText("Hello")).toBeDefined();
  });

  it("debe aplicar messageOptions como objeto", () => {
    const messageOptions = { className: "custom-class" };
    render(
      <MessageList messages={mockMessages} messageOptions={messageOptions} />,
    );
    expect(screen.getByText("Hello")).toBeDefined();
  });

  it("debe aplicar messageOptions como función", () => {
    const messageOptions = (message: Message) => ({
      className: `message-${message.role}`,
    });
    render(
      <MessageList messages={mockMessages} messageOptions={messageOptions} />,
    );
    expect(screen.getByText("Hello")).toBeDefined();
  });
});
