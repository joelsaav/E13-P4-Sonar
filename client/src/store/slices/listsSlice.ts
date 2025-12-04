import { api, apiErrorMessage } from "@/lib/api";
import type { SharePermission } from "@/types/permissions";
import type { List, ListsState } from "@/types/tasks-system/list";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ListsState = {
  lists: [],
  selectedListId: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchLists = createAsyncThunk(
  "lists/fetchLists",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<List[]>("/lists");
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const fetchSharedLists = createAsyncThunk(
  "lists/fetchSharedLists",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<List[]>("/lists/shared");
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const createList = createAsyncThunk(
  "lists/createList",
  async (listData: Partial<List>, { rejectWithValue }) => {
    try {
      const { data } = await api.post<List>("/lists", listData);
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const updateList = createAsyncThunk(
  "lists/updateList",
  async (
    { id, ...updates }: Partial<List> & { id: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch<List>(`/lists/${id}`, updates);
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const deleteList = createAsyncThunk(
  "lists/deleteList",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/lists/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const shareList = createAsyncThunk(
  "lists/shareList",
  async (
    {
      listId,
      email,
      permission,
    }: { listId: string; email: string; permission?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post<List>(`/lists/${listId}/share`, {
        email,
        permission,
      });
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const updateListSharePermission = createAsyncThunk(
  "lists/updateListSharePermission",
  async (
    {
      listId,
      userId,
      permission,
    }: { listId: string; userId: string; permission: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch<List>(
        `/lists/${listId}/share/${userId}`,
        {
          permission,
        },
      );
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const unshareList = createAsyncThunk(
  "lists/unshareList",
  async (
    { listId, userId }: { listId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.delete<List>(
        `/lists/${listId}/share/${userId}`,
      );
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    setSelectedList: (state, action: PayloadAction<string | null>) => {
      state.selectedListId = action.payload;
    },
    resetListsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Lists
    builder
      .addCase(fetchLists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lists = action.payload;
        state.error = null;
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSharedLists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSharedLists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lists = action.payload;
        state.error = null;
      })
      .addCase(fetchSharedLists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create List
    builder
      .addCase(createList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lists.unshift(action.payload);
        state.error = null;
      })
      .addCase(createList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update List
    builder
      .addCase(updateList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateList.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.lists.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete List
    builder
      .addCase(deleteList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lists = state.lists.filter((list) => list.id !== action.payload);
        if (state.selectedListId === action.payload) {
          state.selectedListId = null;
        }
        state.error = null;
      })
      .addCase(deleteList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Share List
    builder
      .addCase(shareList.pending, (state) => {
        state.error = null;
      })
      .addCase(shareList.fulfilled, (state, action) => {
        const index = state.lists.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(shareList.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Share Permission
    builder
      .addCase(updateListSharePermission.pending, (state, action) => {
        state.error = null;
        const list = state.lists.find((l) => l.id === action.meta.arg.listId);
        if (list && list.shares) {
          const share = list.shares.find(
            (s) => s.userId === action.meta.arg.userId,
          );
          if (share) {
            share.permission = action.meta.arg.permission as SharePermission;
          }
        }
      })
      .addCase(updateListSharePermission.fulfilled, (state, action) => {
        const index = state.lists.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateListSharePermission.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Unshare List
    builder
      .addCase(unshareList.pending, (state) => {
        state.error = null;
      })
      .addCase(unshareList.fulfilled, (state, action) => {
        const index = state.lists.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(unshareList.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setLoading, setError, setSelectedList, resetListsState } =
  listsSlice.actions;

export default listsSlice.reducer;

export const selectLists = (state: { lists: ListsState }) => state.lists.lists;
export const selectListsLoading = (state: { lists: ListsState }) =>
  state.lists.isLoading;
export const selectListsError = (state: { lists: ListsState }) =>
  state.lists.error;
export const selectSelectedListId = (state: { lists: ListsState }) =>
  state.lists.selectedListId;
export const selectSelectedList = (state: { lists: ListsState }) => {
  const { lists, selectedListId } = state.lists;
  return lists.find((list) => list.id === selectedListId) || null;
};
export const selectListById =
  (listId: string) => (state: { lists: ListsState }) =>
    state.lists.lists.find((list) => list.id === listId) || null;
export const selectOwnedLists =
  (userId: string) => (state: { lists: ListsState }) =>
    state.lists.lists.filter((list) => list.ownerId === userId);
export const selectSharedLists =
  (userId: string) => (state: { lists: ListsState }) =>
    state.lists.lists.filter((list) =>
      list.shares?.some((share) => share.userId === userId),
    );
