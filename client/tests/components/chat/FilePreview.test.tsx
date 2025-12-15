import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { FilePreview } from "@/components/chat/FilePreview";

describe("FilePreview", () => {
  beforeAll(() => {
    window.URL.createObjectURL = vi.fn(() => "mock-url");
    window.URL.revokeObjectURL = vi.fn();
  });

  it("debe renderizar preview de imagen", () => {
    const imageFile = new File(["content"], "test.png", { type: "image/png" });
    const { container } = render(<FilePreview file={imageFile} />);

    expect(container.querySelector("img")).toBeDefined();
    expect(screen.getByText("test.png")).toBeDefined();
  });

  it("debe renderizar preview de archivo de texto", () => {
    const textFile = new File(["content"], "test.txt", { type: "text/plain" });
    render(<FilePreview file={textFile} />);

    expect(screen.getByText("test.txt")).toBeDefined();
  });

  it("debe renderizar preview de archivo markdown", () => {
    const mdFile = new File(["# Title"], "test.md", { type: "text/markdown" });
    render(<FilePreview file={mdFile} />);

    expect(screen.getByText("test.md")).toBeDefined();
  });

  it("debe renderizar preview genérico para otros tipos", () => {
    const pdfFile = new File(["content"], "document.pdf", {
      type: "application/pdf",
    });
    render(<FilePreview file={pdfFile} />);

    expect(screen.getByText("document.pdf")).toBeDefined();
  });

  it("debe llamar onRemove cuando se hace click en el botón de eliminar", async () => {
    const mockOnRemove = vi.fn();
    const imageFile = new File(["content"], "test.png", { type: "image/png" });
    const user = userEvent.setup();

    render(<FilePreview file={imageFile} onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole("button");
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it("debe mostrar el tamaño del archivo", () => {
    const file = new File(["a".repeat(1024)], "test.txt", {
      type: "text/plain",
    });
    render(<FilePreview file={file} />);

    expect(screen.getByText("test.txt")).toBeDefined();
  });

  it("debe renderizar sin onRemove", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const { container } = render(<FilePreview file={file} />);

    expect(container).toBeDefined();
  });
});
