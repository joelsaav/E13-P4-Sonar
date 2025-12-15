import { ChatForm } from "@/components/chat/ChatForm";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createRef } from "react";

describe("ChatForm", () => {
  const mockHandleSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with children and passes file state", () => {
    let receivedFiles: File[] | null = null;
    let receivedSetFiles: React.Dispatch<
      React.SetStateAction<File[] | null>
    > | null = null;

    const { container } = render(
      <ChatForm
        isPending={false}
        handleSubmit={mockHandleSubmit}
        className="custom-class"
      >
        {({ files, setFiles }) => {
          receivedFiles = files;
          receivedSetFiles = setFiles;
          return <div data-testid="child-content">Child Content</div>;
        }}
      </ChatForm>,
    );

    expect(container.querySelector("form")).toBeInTheDocument();
    expect(container.querySelector("form")).toHaveClass("custom-class");
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(receivedFiles).toBeNull();
    expect(receivedSetFiles).toBeDefined();
  });

  it("forwards ref to form element", () => {
    const formRef = createRef<HTMLFormElement>();

    render(
      <ChatForm ref={formRef} isPending={false} handleSubmit={mockHandleSubmit}>
        {() => <div>Test</div>}
      </ChatForm>,
    );

    expect(formRef.current).toBeInstanceOf(HTMLFormElement);
  });

  it("calls handleSubmit on form submission", () => {
    render(
      <ChatForm isPending={false} handleSubmit={mockHandleSubmit}>
        {() => <button type="submit">Submit</button>}
      </ChatForm>,
    );

    const form = document.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("calls handleSubmit with files when files are set", async () => {
    let setFilesRef: React.Dispatch<React.SetStateAction<File[] | null>>;

    render(
      <ChatForm isPending={false} handleSubmit={mockHandleSubmit}>
        {({ setFiles }) => {
          setFilesRef = setFiles;
          return <button type="submit">Submit</button>;
        }}
      </ChatForm>,
    );

    const testFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    await import("@testing-library/react").then(({ act }) => {
      act(() => {
        setFilesRef!([testFile]);
      });
    });

    const form = document.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );

    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
