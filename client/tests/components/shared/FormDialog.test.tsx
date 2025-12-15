import { FormDialog } from "@/components/shared/FormDialog";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.cancel": "Cancel",
      };
      return translations[key] || key;
    },
  }),
}));

describe("FormDialog", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockReturnValue(undefined);
  });

  it("renders without crashing when open", () => {
    expect(() =>
      render(
        <FormDialog
          open={true}
          onOpenChange={() => {}}
          title="Test Title"
          description="Test Description"
          onSubmit={mockOnSubmit}
          submitLabel="Submit"
        >
          <div>Form Content</div>
        </FormDialog>,
      ),
    ).not.toThrow();
  });

  it("renders title and description", () => {
    render(
      <FormDialog
        open={true}
        onOpenChange={() => {}}
        title="Test Title"
        description="Test Description"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      >
        <div>Form Content</div>
      </FormDialog>,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <FormDialog
        open={true}
        onOpenChange={() => {}}
        title="Test"
        description="Test"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      >
        <div data-testid="child">Form Content</div>
      </FormDialog>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders submit button with label", () => {
    render(
      <FormDialog
        open={true}
        onOpenChange={() => {}}
        title="Test"
        description="Test"
        onSubmit={mockOnSubmit}
        submitLabel="Save Changes"
      >
        <div>Content</div>
      </FormDialog>,
    );

    expect(
      screen.getByRole("button", { name: "Save Changes" }),
    ).toBeInTheDocument();
  });

  it("renders cancel button with default label", () => {
    render(
      <FormDialog
        open={true}
        onOpenChange={() => {}}
        title="Test"
        description="Test"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      >
        <div>Content</div>
      </FormDialog>,
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders cancel button with custom label", () => {
    render(
      <FormDialog
        open={true}
        onOpenChange={() => {}}
        title="Test"
        description="Test"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
        cancelLabel="Discard"
      >
        <div>Content</div>
      </FormDialog>,
    );

    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", async () => {
    render(
      <FormDialog
        open={true}
        onOpenChange={() => {}}
        title="Test"
        description="Test"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      >
        <div>Content</div>
      </FormDialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it("calls onOpenChange when cancel is clicked", () => {
    const mockOnOpenChange = vi.fn();

    render(
      <FormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test"
        description="Test"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      >
        <div>Content</div>
      </FormDialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not close dialog when onSubmit returns false", async () => {
    const mockOnOpenChange = vi.fn();
    mockOnSubmit.mockReturnValue(false);

    render(
      <FormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test"
        description="Test"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      >
        <div>Content</div>
      </FormDialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it("renders with trigger", () => {
    render(
      <FormDialog
        trigger={<button>Open Dialog</button>}
        title="Test"
        description="Test"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      >
        <div>Content</div>
      </FormDialog>,
    );

    expect(
      screen.getByRole("button", { name: "Open Dialog" }),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <FormDialog
        open={true}
        onOpenChange={() => {}}
        title="Test"
        description="Test"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
        className="custom-class"
      >
        <div>Content</div>
      </FormDialog>,
    );

    expect(document.querySelector(".custom-class")).toBeInTheDocument();
  });
});
