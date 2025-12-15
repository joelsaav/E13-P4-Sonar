import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatMessage } from "@/components/chat/ChatMessage";

vi.mock("@/components/chat/MarkdownRenderer", () => ({
  MarkdownRenderer: ({ children }: { children: string }) => (
    <div data-testid="markdown">{children}</div>
  ),
}));

vi.mock("@/components/chat/FilePreview", () => ({
  FilePreview: ({ file }: { file: File }) => (
    <div data-testid="file-preview">{file.name}</div>
  ),
}));

describe("ChatMessage", () => {
  const defaultProps = {
    role: "user" as const,
    content: "Hello",
    id: "1",
    createdAt: new Date(),
  };

  it("renders user message", () => {
    render(<ChatMessage {...defaultProps} />);
    expect(screen.getByText("Hello")).toBeDefined();
  });

  it("renders assistant message", () => {
    render(
      <ChatMessage {...defaultProps} role="assistant" content="Hi there" />,
    );
    expect(screen.getByText("Hi there")).toBeDefined();
  });

  it("renders with timestamp", () => {
    render(<ChatMessage {...defaultProps} showTimeStamp={true} />);
    expect(screen.getByRole("time")).toBeDefined();
  });

  it("renders with actions", () => {
    render(
      <ChatMessage
        {...defaultProps}
        role="assistant"
        actions={<button>Copy</button>}
      />,
    );
    expect(screen.getByText("Hello")).toBeDefined();
  });

  it("renders with text parts", () => {
    render(
      <ChatMessage
        id="3"
        role="assistant"
        content=""
        parts={[{ type: "text", text: "Part text content" }]}
        createdAt={new Date()}
      />,
    );
    expect(screen.getByText("Part text content")).toBeDefined();
  });

  it("renders with reasoning parts", () => {
    render(
      <ChatMessage
        id="4"
        role="assistant"
        content=""
        parts={[{ type: "reasoning", reasoning: "Reasoning content" }]}
        createdAt={new Date()}
      />,
    );
    expect(screen.getByText("Thinking")).toBeDefined();
  });

  it("renders with tool invocation - call state", () => {
    render(
      <ChatMessage
        id="5"
        role="assistant"
        content=""
        parts={[
          {
            type: "tool-invocation",
            toolInvocation: { state: "call", toolName: "testTool" },
          },
        ]}
        createdAt={new Date()}
      />,
    );
    expect(screen.getByText(/Calling/)).toBeDefined();
  });

  it("renders with toolInvocations prop - result state", () => {
    render(
      <ChatMessage
        id="7"
        role="assistant"
        content=""
        toolInvocations={[
          { state: "result", toolName: "resultTool", result: { data: "test" } },
        ]}
        createdAt={new Date()}
      />,
    );
    expect(screen.getByText(/Result from/)).toBeDefined();
  });

  it("renders cancelled tool invocation", () => {
    render(
      <ChatMessage
        id="8"
        role="assistant"
        content=""
        toolInvocations={[
          {
            state: "result",
            toolName: "cancelledTool",
            result: { __cancelled: true },
          },
        ]}
        createdAt={new Date()}
      />,
    );
    expect(screen.getByText(/Cancelled/)).toBeDefined();
  });
});
