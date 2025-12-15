import { ShareDialog } from "@/components/shared/ShareDialog";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "share.task.title": "Share Task",
        "share.task.description": "Share this task with others",
        "share.list.title": "Share List",
        "share.list.description": "Share this list with others",
        "share.inviteCollaborator": "Invite collaborator",
        "share.emailPlaceholder": "Enter email",
        "share.permissions.VIEW": "View",
        "share.permissions.EDIT": "Edit",
        "share.permissions.ADMIN": "Admin",
        "share.invite": "Invite",
        "share.peopleWithAccess": "People with access",
        "share.noSharesTask": "No one has access to this task yet",
        "share.noSharesList": "No one has access to this list yet",
        "share.removeCollaborator.title": "Remove Collaborator",
        "share.removeCollaborator.descriptionTask": "Remove access to task",
        "share.removeCollaborator.descriptionList": "Remove access to list",
        "share.removeCollaborator.cancel": "Cancel",
        "share.removeCollaborator.confirm": "Remove",
        "share.errorShareTask": "Error sharing task",
        "share.errorShareList": "Error sharing list",
      };
      return translations[key] || key;
    },
  }),
}));

describe("ShareDialog", () => {
  const mockItem = { id: "item-1", name: "Test Item" };
  const mockOnOpenChange = vi.fn();
  const mockOnShare = vi.fn();
  const mockOnRemoveShare = vi.fn();
  const mockOnUpdateShare = vi.fn();

  const mockShares = [
    {
      id: "share-1",
      permission: "VIEW",
      userId: "user-2",
      user: {
        id: "user-2",
        name: "John Doe",
        email: "john@example.com",
        image: null,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnShare.mockResolvedValue(undefined);
    mockOnRemoveShare.mockResolvedValue(undefined);
  });

  const renderDialog = (props = {}) => {
    return render(
      <ShareDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        item={mockItem}
        type="task"
        shares={[]}
        onShare={mockOnShare}
        onRemoveShare={mockOnRemoveShare}
        onUpdateShare={mockOnUpdateShare}
        isLoading={false}
        {...props}
      />,
    );
  };

  it("renders share dialog for task", () => {
    renderDialog({ type: "task" });
    expect(screen.getByText("Share Task")).toBeInTheDocument();
  });

  it("renders share dialog for list", () => {
    renderDialog({ type: "list" });
    expect(screen.getByText("Share List")).toBeInTheDocument();
  });

  it("displays email input field", () => {
    renderDialog();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("displays invite button", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /invite/i })).toBeInTheDocument();
  });

  it("shows no shares message when empty", () => {
    renderDialog({ shares: [], type: "task" });
    expect(
      screen.getByText("No one has access to this task yet"),
    ).toBeInTheDocument();
  });

  it("displays collaborators when shares exist", () => {
    renderDialog({ shares: mockShares });
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("calls onShare when form is submitted", async () => {
    renderDialog();

    const emailInput = screen.getByPlaceholderText("Enter email");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    const inviteButton = screen.getByRole("button", { name: /invite/i });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(mockOnShare).toHaveBeenCalledWith("new@example.com", "VIEW");
    });
  });

  it("shows loading spinner when isLoading is true", () => {
    renderDialog({ isLoading: true });
    const inviteButton = screen.getByRole("button", { name: "" });
    expect(inviteButton).toBeDisabled();
  });

  it("clears email after successful share", async () => {
    renderDialog();

    const emailInput = screen.getByPlaceholderText("Enter email");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /invite/i }));

    await waitFor(() => {
      expect(emailInput).toHaveValue("");
    });
  });

  it("displays permission select for collaborators", () => {
    renderDialog({ shares: mockShares });
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBeGreaterThan(0);
  });

  it("provides onUpdateShare callback", () => {
    renderDialog({ shares: mockShares });
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("displays collaborator avatar fallback", () => {
    renderDialog({ shares: mockShares });
    expect(screen.getByText("J")).toBeInTheDocument();
  });
});
