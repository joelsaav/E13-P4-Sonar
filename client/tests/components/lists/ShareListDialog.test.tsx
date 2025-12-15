import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ShareListDialog from "@/components/lists/ShareListDialog";

const mockShareList = vi.fn();
const mockRemoveShare = vi.fn();
const mockUpdateShare = vi.fn();

vi.mock("@/hooks/useLists", () => ({
  useLists: () => ({
    shareList: mockShareList,
    removeShare: mockRemoveShare,
    updateShare: mockUpdateShare,
    isLoading: false,
  }),
}));

vi.mock("@/components/shared/ShareDialog", () => ({
  ShareDialog: ({ onShare, onRemoveShare, onUpdateShare, shares }: any) => (
    <div data-testid="share-dialog">
      <button onClick={() => onShare("test@example.com", "EDIT")}>Share</button>
      {shares.map((s: any) => (
        <div key={s.id}>
          <button onClick={() => onRemoveShare(s.userId)}>
            Remove {s.userId}
          </button>
          <button onClick={() => onUpdateShare(s.userId, "ADMIN")}>
            Update {s.userId}
          </button>
        </div>
      ))}
    </div>
  ),
}));

describe("ShareListDialog", () => {
  const mockList = {
    id: "list-1",
    name: "Test List",
    ownerId: "owner-1",
    shares: [
      {
        id: "share-1",
        userId: "user-2",
        permission: "VIEW",
        user: { id: "user-2", name: "User 2", email: "u2@test.com" },
      },
    ],
  };

  it("renders share dialog and handles share action", () => {
    render(
      <ShareListDialog
        open={true}
        onOpenChange={vi.fn()}
        list={mockList as any}
      />,
    );

    expect(screen.getByTestId("share-dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Share"));
    expect(mockShareList).toHaveBeenCalledWith(
      "list-1",
      expect.objectContaining({
        permission: "EDIT",
        user: expect.objectContaining({ email: "test@example.com" }),
      }),
    );
  });

  it("handles remove share action", () => {
    render(
      <ShareListDialog
        open={true}
        onOpenChange={vi.fn()}
        list={mockList as any}
      />,
    );

    fireEvent.click(screen.getByText("Remove user-2"));
    expect(mockRemoveShare).toHaveBeenCalledWith("list-1", "user-2");
  });

  it("handles update share action", () => {
    render(
      <ShareListDialog
        open={true}
        onOpenChange={vi.fn()}
        list={mockList as any}
      />,
    );

    fireEvent.click(screen.getByText("Update user-2"));
    expect(mockUpdateShare).toHaveBeenCalledWith(
      "list-1",
      expect.objectContaining({
        id: "share-1",
        permission: "ADMIN",
      }),
    );
  });
});
