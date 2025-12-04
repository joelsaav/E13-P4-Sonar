import { api, apiErrorMessage } from "@/lib/api";
import type { SharePermission } from "@/types/permissions";
import type {
  Task,
  TaskPriority,
  TasksState,
  TaskStatus,
} from "@/types/tasks-system/task";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { deleteList } from "./listsSlice";

const initialState: TasksState = {
  tasks: [],
  selectedTaskId: null,
  isLoading: false,
  error: null,
  filters: {
    status: "all",
    listId: null,
    search: "",
    priority: "all",
  },
  sorting: {
    field: "createdAt",
    order: "desc",
  },
};

// Async Thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Task[]>("/tasks");
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const fetchSharedTasks = createAsyncThunk(
  "tasks/fetchSharedTasks",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Task[]>("/tasks/shared");
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData: Partial<Task>, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Task>("/tasks", taskData);
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    { id, ...updates }: Partial<Task> & { id: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch<Task>(`/tasks/${id}`, updates);
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const shareTask = createAsyncThunk(
  "tasks/shareTask",
  async (
    {
      taskId,
      email,
      permission,
    }: { taskId: string; email: string; permission?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post<Task>(`/tasks/${taskId}/share`, {
        email,
        permission,
      });
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const updateTaskSharePermission = createAsyncThunk(
  "tasks/updateTaskSharePermission",
  async (
    {
      taskId,
      userId,
      permission,
    }: { taskId: string; userId: string; permission: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch<Task>(
        `/tasks/${taskId}/share/${userId}`,
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

export const unshareTask = createAsyncThunk(
  "tasks/unshareTask",
  async (
    { taskId, userId }: { taskId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.delete<Task>(
        `/tasks/${taskId}/share/${userId}`,
      );
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setTaskStatus: (
      state,
      action: PayloadAction<{ id: string; status: TaskStatus }>,
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
        if (action.payload.status === "COMPLETED") {
          task.completed = true;
          task.completedAt = new Date().toISOString();
        } else {
          task.completed = false;
          task.completedAt = undefined;
        }
      }
    },
    setSelectedTask: (state, action: PayloadAction<string | null>) => {
      state.selectedTaskId = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<"all" | TaskStatus>) => {
      state.filters.status = action.payload;
    },
    setListFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.listId = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<"all" | TaskPriority>) => {
      state.filters.priority = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        status: "all",
        listId: null,
        search: "",
        priority: "all",
      };
    },
    setSorting: (
      state,
      action: PayloadAction<{
        field: "name" | "dueDate" | "priority" | "createdAt" | "updatedAt";
        order: "asc" | "desc";
      }>,
    ) => {
      state.sorting = action.payload;
    },
    toggleSortOrder: (state) => {
      state.sorting.order = state.sorting.order === "asc" ? "desc" : "asc";
    },
    resetTasksState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSharedTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSharedTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchSharedTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state, action) => {
        state.error = null;
        const index = state.tasks.findIndex((t) => t.id === action.meta.arg.id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.meta.arg };
          if (action.meta.arg.status) {
            if (action.meta.arg.status === "COMPLETED") {
              state.tasks[index].completed = true;
              state.tasks[index].completedAt = new Date().toISOString();
            } else {
              state.tasks[index].completed = false;
              state.tasks[index].completedAt = undefined;
            }
          }
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            ...action.payload,
            list:
              action.payload.list && state.tasks[index].list
                ? { ...state.tasks[index].list, ...action.payload.list }
                : action.payload.list || state.tasks[index].list,
            shares: action.payload.shares || state.tasks[index].shares,
          };
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
        if (state.selectedTaskId === action.payload) {
          state.selectedTaskId = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Share Task
    builder
      .addCase(shareTask.pending, (state) => {
        state.error = null;
      })
      .addCase(shareTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            ...action.payload,
            list:
              action.payload.list && state.tasks[index].list
                ? { ...state.tasks[index].list, ...action.payload.list }
                : action.payload.list || state.tasks[index].list,
            shares: action.payload.shares || state.tasks[index].shares,
          };
        }
        state.error = null;
      })
      .addCase(shareTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Share Permission
    builder
      .addCase(updateTaskSharePermission.pending, (state, action) => {
        state.error = null;
        const task = state.tasks.find((t) => t.id === action.meta.arg.taskId);
        if (task && task.shares) {
          const share = task.shares.find(
            (s) => s.userId === action.meta.arg.userId,
          );
          if (share) {
            share.permission = action.meta.arg.permission as SharePermission;
          }
        }
      })
      .addCase(updateTaskSharePermission.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            ...action.payload,
            list:
              action.payload.list && state.tasks[index].list
                ? { ...state.tasks[index].list, ...action.payload.list }
                : action.payload.list || state.tasks[index].list,
            shares: action.payload.shares || state.tasks[index].shares,
          };
        }
        state.error = null;
      })
      .addCase(updateTaskSharePermission.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Unshare Task
    builder
      .addCase(unshareTask.pending, (state) => {
        state.error = null;
      })
      .addCase(unshareTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            ...action.payload,
            list:
              action.payload.list && state.tasks[index].list
                ? { ...state.tasks[index].list, ...action.payload.list }
                : action.payload.list || state.tasks[index].list,
            shares: action.payload.shares || state.tasks[index].shares,
          };
        }
        state.error = null;
      })
      .addCase(unshareTask.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(
          (task) => task.listId !== action.payload,
        );
      });
  },
});

export const {
  setLoading,
  setError,
  setTaskStatus,
  setSelectedTask,
  setStatusFilter,
  setListFilter,
  setSearchFilter,
  setPriorityFilter,
  clearFilters,
  setSorting,
  toggleSortOrder,
  resetTasksState,
} = tasksSlice.actions;

export default tasksSlice.reducer;

export const selectTasks = (state: { tasks: TasksState }) => state.tasks.tasks;
export const selectTasksLoading = (state: { tasks: TasksState }) =>
  state.tasks.isLoading;
export const selectTasksError = (state: { tasks: TasksState }) =>
  state.tasks.error;
export const selectSelectedTaskId = (state: { tasks: TasksState }) =>
  state.tasks.selectedTaskId;
export const selectTaskFilters = (state: { tasks: TasksState }) =>
  state.tasks.filters;
export const selectTaskSorting = (state: { tasks: TasksState }) =>
  state.tasks.sorting;

export const selectSelectedTask = (state: { tasks: TasksState }) => {
  const { tasks, selectedTaskId } = state.tasks;
  return tasks.find((task) => task.id === selectedTaskId) || null;
};

export const selectTaskById =
  (taskId: string) => (state: { tasks: TasksState }) =>
    state.tasks.tasks.find((task) => task.id === taskId) || null;

export const selectTasksByListId =
  (listId: string) => (state: { tasks: TasksState }) =>
    state.tasks.tasks.filter((task) => task.listId === listId);

export const selectFilteredTasks = (state: { tasks: TasksState }) => {
  const { tasks, filters, sorting } = state.tasks;
  let filtered = [...tasks];

  if (filters.status !== "all") {
    filtered = filtered.filter((task) => task.status === filters.status);
  }

  if (filters.listId) {
    filtered = filtered.filter((task) => task.listId === filters.listId);
  }

  if (filters.priority !== "all") {
    filtered = filtered.filter((task) => task.priority === filters.priority);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.name.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower),
    );
  }

  filtered.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sorting.field) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "dueDate":
        aValue = a.dueDate || "";
        bValue = b.dueDate || "";
        break;
      case "priority": {
        const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      }
      case "updatedAt":
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
      case "createdAt":
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
    }

    if (aValue < bValue) return sorting.order === "asc" ? -1 : 1;
    if (aValue > bValue) return sorting.order === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
};

export const selectTasksByStatus = (state: { tasks: TasksState }) => {
  const { tasks } = state.tasks;
  return {
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    total: tasks.length,
  };
};

export const selectTasksByPriority = (state: { tasks: TasksState }) => {
  const { tasks } = state.tasks;
  return {
    low: tasks.filter((t) => t.priority === "LOW").length,
    medium: tasks.filter((t) => t.priority === "MEDIUM").length,
    high: tasks.filter((t) => t.priority === "HIGH").length,
    urgent: tasks.filter((t) => t.priority === "URGENT").length,
  };
};

export const selectSharedTasks =
  (userId: string) => (state: { tasks: TasksState }) =>
    state.tasks.tasks.filter((task) =>
      task.shares?.some((share) => share.userId === userId),
    );
