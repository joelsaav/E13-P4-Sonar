import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";

vi.mock("react-markdown", () => ({
  default: ({ children, components }: any) => {
    return (
      <div data-testid="markdown-content">
        {children}

        {components?.code &&
          components.code({
            children: "console.log('test')",
            className: "language-js",
            node: {},
          })}
      </div>
    );
  },
}));

vi.mock("remark-gfm", () => ({
  default: () => "remark-gfm",
}));

describe("MarkdownRenderer", () => {
  it("renders markdown content", () => {
    render(<MarkdownRenderer># Test Heading</MarkdownRenderer>);
    expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
    expect(screen.getByText("# Test Heading")).toBeInTheDocument();
  });

  it("renders with code block", () => {
    render(<MarkdownRenderer>```js console.log('test') ```</MarkdownRenderer>);
    expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
  });
});
