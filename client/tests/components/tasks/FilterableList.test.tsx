import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { FilterableList } from "@/components/tasks/FilterableList";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import listsReducer from "@/store/slices/listsSlice";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/lists/CreateListDialog", () => ({
  CreateListDialogStandalone: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="create-list-dialog">{children}</div>
  ),
}));

describe("FilterableList", () => {
  let store: ReturnType<typeof configureStore>;

  const defaultProps = {
    title: "My Lists",
    items: [],
    selectedId: null,
    onItemClick: vi.fn(),
    emptyMessage: "No lists",
    icon: "IconList",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
        lists: listsReducer,
      },
      preloadedState: {
        auth: {
          user: { id: "user-1", name: "Test User" },
          token: "token",
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitializing: false,
        },
        lists: {
          lists: [],
          isLoading: false,
          error: null,
          selectedListId: null,
        },
      },
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <FilterableList {...defaultProps} {...props} />
        </MemoryRouter>
      </Provider>,
    );
  };

  it("renders title and add button", () => {
    renderComponent();
    expect(screen.getByText("My Lists")).toBeInTheDocument();
    expect(screen.getByTestId("create-list-dialog")).toBeInTheDocument();
  });

  it("renders empty message when no items", () => {
    renderComponent();
    expect(screen.getByText("No lists")).toBeInTheDocument();
  });

  it("renders items when provided", () => {
    const items = [
      { id: "list-1", name: "List One", count: 5 },
      { id: "list-2", name: "List Two", count: 3, description: "Description" },
    ];
    renderComponent({ items });
    expect(screen.getByText("List One")).toBeInTheDocument();
    expect(screen.getByText("List Two")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("calls onItemClick when item is clicked", async () => {
    const user = userEvent.setup();
    const items = [{ id: "list-1", name: "List One", count: 5 }];
    const onItemClick = vi.fn();
    renderComponent({ items, onItemClick });

    await user.click(screen.getByText("List One"));

    expect(onItemClick).toHaveBeenCalledWith("list-1");
  });

  it("renders loading skeletons when loading", () => {
    const { container } = renderComponent({ isLoading: true });
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("hides add button when showAddButton is false", () => {
    renderComponent({ showAddButton: false });
    expect(screen.queryByTestId("create-list-dialog")).not.toBeInTheDocument();
  });

  it("highlights selected item", () => {
    const items = [{ id: "list-1", name: "List One", count: 5 }];
    const { container } = renderComponent({ items, selectedId: "list-1" });
    const selectedItem = container.querySelector(".bg-primary");
    expect(selectedItem).toBeInTheDocument();
  });
});
