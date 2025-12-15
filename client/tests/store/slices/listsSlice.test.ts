import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import listsReducer, {
  createList,
  deleteList,
  fetchLists,
  fetchSharedLists,
  listCreated,
  listDeleted,
  listUpdated,
  setSelectedList,
  shareList,
  unshareList,
  updateList,
  updateListSharePermission,
} from "@/store/slices/listsSlice";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/lib/api";

type RootState = {
  lists: ReturnType<typeof listsReducer>;
};

describe("listsSlice", () => {
  let store: ReturnType<typeof configureStore<RootState>>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        lists: listsReducer,
      },
    });
  });

  describe("reducers", () => {
    it("should handle setSelectedList", () => {
      store.dispatch(setSelectedList("list-123"));
      expect(store.getState().lists.selectedListId).toBe("list-123");

      store.dispatch(setSelectedList(null));
      expect(store.getState().lists.selectedListId).toBeNull();
    });

    it("should handle listUpdated", () => {
      const initialList = {
        id: "1",
        name: "Old Name",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store = configureStore({
        reducer: { lists: listsReducer },
        preloadedState: {
          lists: {
            lists: [initialList],
            selectedListId: null,
            isLoading: false,
            error: null,
          },
        },
      });

      const updatedList = { ...initialList, name: "New Name" };
      store.dispatch(listUpdated(updatedList));

      expect(store.getState().lists.lists[0].name).toBe("New Name");
    });

    it("should not update list if not found", () => {
      const list = {
        id: "nonexistent",
        name: "Test",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.dispatch(listUpdated(list));
      expect(store.getState().lists.lists).toEqual([]);
    });

    it("should handle listCreated", () => {
      const newList = {
        id: "1",
        name: "New List",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.dispatch(listCreated(newList));
      expect(store.getState().lists.lists).toHaveLength(1);
      expect(store.getState().lists.lists[0]).toEqual(newList);
    });

    it("should not add duplicate list", () => {
      const list = {
        id: "1",
        name: "List",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.dispatch(listCreated(list));
      store.dispatch(listCreated(list));
      expect(store.getState().lists.lists).toHaveLength(1);
    });

    it("should handle listDeleted", () => {
      const list = {
        id: "1",
        name: "List",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store = configureStore({
        reducer: { lists: listsReducer },
        preloadedState: {
          lists: {
            lists: [list],
            selectedListId: "1",
            isLoading: false,
            error: null,
          },
        },
      });

      store.dispatch(listDeleted("1"));
      expect(store.getState().lists.lists).toHaveLength(0);
      expect(store.getState().lists.selectedListId).toBeNull();
    });
  });

  describe("async thunks", () => {
    it("should handle fetchLists.fulfilled", async () => {
      const mockLists = [
        {
          id: "1",
          name: "List 1",
          userId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(api.get).mockResolvedValue({ data: mockLists });

      await store.dispatch(fetchLists());

      const state = store.getState().lists;
      expect(state.lists).toEqual(mockLists);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should handle fetchLists.rejected", async () => {
      const mockError = {
        response: { data: { message: "Network error" } },
        message: "Network error",
      };
      vi.mocked(api.get).mockRejectedValue(mockError);

      await store.dispatch(fetchLists());

      const state = store.getState().lists;
      expect(state.isLoading).toBe(false);
      expect(state.error).not.toBeNull();
    });

    it("should handle fetchSharedLists.fulfilled", async () => {
      const mockLists = [
        {
          id: "1",
          name: "Shared List",
          userId: "user-2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(api.get).mockResolvedValue({ data: mockLists });

      await store.dispatch(fetchSharedLists());

      expect(store.getState().lists.lists).toEqual(mockLists);
    });

    it("should handle createList.fulfilled", async () => {
      const newList = {
        id: "1",
        name: "New List",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.post).mockResolvedValue({ data: newList });

      await store.dispatch(createList({ name: "New List" }));

      expect(api.post).toHaveBeenCalledWith("/lists", { name: "New List" });
    });

    it("should handle updateList.fulfilled", async () => {
      const updatedList = {
        id: "1",
        name: "Updated List",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.patch).mockResolvedValue({ data: updatedList });

      await store.dispatch(updateList({ id: "1", name: "Updated List" }));

      expect(api.patch).toHaveBeenCalledWith("/lists/1", {
        name: "Updated List",
      });
    });

    it("should handle deleteList.fulfilled", async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: {} });

      await store.dispatch(deleteList("1"));

      expect(api.delete).toHaveBeenCalledWith("/lists/1");
    });

    it("should handle shareList.fulfilled", async () => {
      const sharedList = {
        id: "1",
        name: "Shared List",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.post).mockResolvedValue({ data: sharedList });

      await store.dispatch(
        shareList({
          listId: "1",
          email: "test@example.com",
          permission: "read",
        }),
      );

      expect(api.post).toHaveBeenCalledWith("/lists/1/share", {
        email: "test@example.com",
        permission: "read",
      });
    });

    it("should handle updateListSharePermission.fulfilled", async () => {
      const updatedList = {
        id: "1",
        name: "List",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.patch).mockResolvedValue({ data: updatedList });

      await store.dispatch(
        updateListSharePermission({
          listId: "1",
          userId: "user-2",
          permission: "write",
        }),
      );

      expect(api.patch).toHaveBeenCalledWith("/lists/1/share/user-2", {
        permission: "write",
      });
    });

    it("should handle unshareList.fulfilled", async () => {
      const unsharedList = {
        id: "1",
        name: "List",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(api.delete).mockResolvedValue({ data: unsharedList });

      await store.dispatch(
        unshareList({
          listId: "1",
          userId: "user-2",
        }),
      );

      expect(api.delete).toHaveBeenCalledWith("/lists/1/share/user-2");
    });
  });
});
