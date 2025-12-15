import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CreateListDialogStandalone } from "@/components/lists/CreateListDialog";
import { I18nTestProvider } from "../../helpers/i18nTestProvider";

vi.mock("@/hooks/useLists", () => ({
  useLists: () => ({
    createList: vi.fn(),
  }),
}));

describe("CreateListDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog trigger button", () => {
    render(
      <I18nTestProvider>
        <CreateListDialogStandalone>
          <button>Create List</button>
        </CreateListDialogStandalone>
      </I18nTestProvider>,
    );

    expect(screen.getByText("Create List")).toBeInTheDocument();
  });

  it("opens dialog when trigger clicked", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <CreateListDialogStandalone>
          <button>Create List</button>
        </CreateListDialogStandalone>
      </I18nTestProvider>,
    );

    await user.click(screen.getByText("Create List"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
  });

  it("shows name input field in dialog", async () => {
    const user = userEvent.setup();

    render(
      <I18nTestProvider>
        <CreateListDialogStandalone>
          <button>Create List</button>
        </CreateListDialogStandalone>
      </I18nTestProvider>,
    );

    await user.click(screen.getByText("Create List"));

    const nameInput = screen.getByLabelText(/nombre/i);
    expect(nameInput).toBeInTheDocument();

    await user.type(nameInput, "My New List");
    expect(nameInput).toHaveValue("My New List");
  });
});
