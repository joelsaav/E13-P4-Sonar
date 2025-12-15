import EditListDialog from "@/components/lists/EditListDialog";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import listsReducer from "@/store/slices/listsSlice";
import tasksReducer from "@/store/slices/tasksSlice";
import themeReducer from "@/store/slices/themeSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";
import uiReducer from "@/store/slices/uiSlice";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "lists.edit.title": "Edit List",
        "lists.edit.description": "Edit your list details",
        "lists.edit.submit": "Save",
        "lists.edit.cancel": "Cancel",
        "lists.fields.name.label": "Name",
        "lists.fields.name.placeholder": "Enter list name",
        "lists.fields.description.label": "Description",
        "lists.fields.description.placeholder": "Enter description",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn(),
  },
  apiErrorMessage: vi.fn(),
}));

describe("EditListDialog", () => {
  const mockList = {
    id: "list-1",
    name: "Test List",
    description: "Test Description",
    userId: "user-1",
    ownerId: "user-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    shares: [],
  };

  const mockOnOpenChange = vi.fn();

  const createStore = () =>
    configureStore({
      reducer: {
        auth: authReducer,
        theme: themeReducer,
        lists: listsReducer,
        tasks: tasksReducer,
        notifications: notificationsReducer,
        ui: uiReducer,
      },
      preloadedState: {
        auth: {
          user: { id: "user-1", email: "test@example.com", name: "Test" },
          token: "token123",
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitializing: false,
        },
        lists: {
          lists: [mockList],
          isLoading: false,
          error: null,
          selectedListId: null,
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (open = true) => {
    return render(
      <Provider store={createStore()}>
        <EditListDialog
          open={open}
          onOpenChange={mockOnOpenChange}
          list={mockList}
        />
      </Provider>,
    );
  };

  it("renders dialog when open", async () => {
    renderComponent(true);

    await waitFor(() => {
      expect(screen.getByText("Edit List")).toBeInTheDocument();
    });
  });

  it("displays list name in input", async () => {
    renderComponent(true);

    await waitFor(() => {
      const input = screen.getByPlaceholderText("Enter list name");
      expect(input).toHaveValue("Test List");
    });
  });

  it("displays list description in textarea", async () => {
    renderComponent(true);

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText("Enter description");
      expect(textarea).toHaveValue("Test Description");
    });
  });

  it("renders name label with required indicator", async () => {
    renderComponent(true);

    await waitFor(() => {
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });

  it("renders description label", async () => {
    renderComponent(true);

    await waitFor(() => {
      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });

  it("allows editing the name", async () => {
    renderComponent(true);

    await waitFor(() => {
      const input = screen.getByPlaceholderText("Enter list name");
      fireEvent.change(input, { target: { value: "Updated List" } });
      expect(input).toHaveValue("Updated List");
    });
  });

  it("allows editing the description", async () => {
    renderComponent(true);

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText("Enter description");
      fireEvent.change(textarea, { target: { value: "Updated Description" } });
      expect(textarea).toHaveValue("Updated Description");
    });
  });

  it("renders submit button", async () => {
    renderComponent(true);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });
  });

  it("renders cancel button", async () => {
    renderComponent(true);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
    });
  });
});
