import {
  getCompletedTasksLastNDays,
  getFavoriteTasks,
  getMostRecentTasks,
  getNextDueTasks,
} from "@/lib/taskFilters";
import {
  shareTask as shareTaskThunk,
  unshareTask as unshareTaskThunk,
  updateTaskSharePermission as updateTaskSharePermissionThunk,
  clearFilters,
  createTask,
  deleteTask,
  fetchTasks,
  fetchSharedTasks,
  selectFilteredTasks,
  selectSelectedTask,
  selectSelectedTaskId,
  selectSharedTasks,
  selectTaskFilters,
  selectTasks,
  selectTasksByListId,
  selectTasksByPriority,
  selectTasksByStatus,
  selectTasksError,
  selectTasksLoading,
  selectTaskSorting,
  setListFilter,
  setError,
  setLoading,
  setPriorityFilter,
  setSearchFilter,
  setSelectedTask,
  setSorting,
  setStatusFilter,
  setTaskStatus,
  toggleSortOrder,
  updateTask,
} from "@/store/slices/tasksSlice";
import { useAppDispatch, useAppSelector } from "./useRedux";

import { selectUser } from "@/store/slices/authSlice";
import {
  canAccessTask,
  getTaskPermission,
  selectAccessibleTasks,
  selectAccessibleTasksByList,
} from "@/store/slices/permissionsSelectors";
import type { SharePermission } from "@/types/permissions";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskShare,
} from "@/types/tasks-system/task";

export function useTasks(listId?: string) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const tasks = useAppSelector(selectTasks);
  const isLoading = useAppSelector(selectTasksLoading);
  const error = useAppSelector(selectTasksError);
  const selectedTaskId = useAppSelector(selectSelectedTaskId);
  const selectedTask = useAppSelector(selectSelectedTask);
  const filters = useAppSelector(selectTaskFilters);
  const sorting = useAppSelector(selectTaskSorting);
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const accessibleTasks = useAppSelector(selectAccessibleTasks);
  const tasksByList = listId ? useAppSelector(selectTasksByListId(listId)) : [];
  const accessibleTasksByList = listId
    ? useAppSelector(selectAccessibleTasksByList(listId))
    : [];

  const completedLastWeekCount = getCompletedTasksLastNDays(accessibleTasks, 7);
  const nextDueTasks = getNextDueTasks(accessibleTasks, 5);
  const recentTasks = getMostRecentTasks(accessibleTasks, 5);
  const favoriteTasks = getFavoriteTasks(accessibleTasks);

  const taskStats = useAppSelector(selectTasksByStatus);
  const priorityStats = useAppSelector(selectTasksByPriority);
  const sharedTasks = useAppSelector(selectSharedTasks(user?.id || ""));

  const fetchAllTasks = () => dispatch(fetchTasks());
  const fetchSharedTasksAction = () => dispatch(fetchSharedTasks());
  const createNewTask = (task: Partial<Task>) => dispatch(createTask(task));
  const editTask = (data: Partial<Task> & { id: string }) =>
    dispatch(updateTask(data));
  const removeTask = (id: string) => dispatch(deleteTask(id));
  const selectTask = (id: string | null) => dispatch(setSelectedTask(id));
  const toggleComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      dispatch(
        updateTask({
          id,
          status: task.status === "COMPLETED" ? "PENDING" : "COMPLETED",
        }),
      );
    }
  };
  const toggleFavorite = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      dispatch(updateTask({ id, favorite: !task.favorite }));
    }
  };
  const changeStatus = (id: string, status: TaskStatus) =>
    dispatch(setTaskStatus({ id, status }));
  const filterByStatus = (status: "all" | TaskStatus) =>
    dispatch(setStatusFilter(status));
  const filterByList = (listId: string | null) =>
    dispatch(setListFilter(listId));
  const filterBySearch = (search: string) => dispatch(setSearchFilter(search));
  const filterByPriority = (priority: "all" | TaskPriority) =>
    dispatch(setPriorityFilter(priority));
  const resetFilters = () => dispatch(clearFilters());
  const sortBy = (
    field: "name" | "dueDate" | "priority" | "createdAt" | "updatedAt",
    order: "asc" | "desc",
  ) => dispatch(setSorting({ field, order }));
  const toggleSort = () => dispatch(toggleSortOrder());
  const shareTask = (taskId: string, email: string, permission: string) =>
    dispatch(shareTaskThunk({ taskId, email, permission }));
  const removeShare = (taskId: string, userId: string) =>
    dispatch(unshareTaskThunk({ taskId, userId }));
  const updateShare = (taskId: string, userId: string, permission: string) =>
    dispatch(updateTaskSharePermissionThunk({ taskId, userId, permission }));
  const setLoadingState = (loading: boolean) => dispatch(setLoading(loading));
  const setErrorState = (error: string | null) => dispatch(setError(error));

  const state = useAppSelector((state) => state);

  const getPermission = (taskId: string): SharePermission | null =>
    getTaskPermission(taskId)(state);
  const canAccess = (
    taskId: string,
    permission: SharePermission = "VIEW",
  ): boolean => canAccessTask(taskId, permission)(state);

  return {
    tasks,
    filteredTasks,
    accessibleTasks,
    tasksByList,
    accessibleTasksByList,
    isLoading,
    error,
    selectedTaskId,
    selectedTask,
    filters,
    sorting,
    taskStats,
    priorityStats,
    sharedTasks,
    completedLastWeekCount,
    nextDueTasks,
    recentTasks,
    favoriteTasks,
    fetchAllTasks,
    fetchSharedTasks: fetchSharedTasksAction,
    createTask: createNewTask,
    editTask,
    removeTask,
    selectTask,
    toggleComplete,
    toggleFavorite,
    changeStatus,
    filterByStatus,
    filterByList,
    filterBySearch,
    filterByPriority,
    resetFilters,
    sortBy,
    toggleSort,
    shareTask,
    updateShare,
    removeShare,
    setLoadingState,
    setErrorState,
    getPermission,
    canAccess,
  };
}
