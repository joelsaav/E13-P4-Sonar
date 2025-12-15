import {
  shareTask as shareTaskThunk,
  unshareTask as unshareTaskThunk,
  updateTaskSharePermission as updateTaskSharePermissionThunk,
  createTask,
  deleteTask,
  fetchTasks,
  fetchSharedTasks,
  selectFilteredTasks,
  selectTaskFilters,
  selectTasks,
  selectTasksError,
  selectTasksLoading,
  selectTaskSorting,
  setListFilter,
  setPriorityFilter,
  setFavoriteFilter,
  setSorting,
  setStatusFilter,
  toggleSortOrder,
  updateTask,
} from "@/store/slices/tasksSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

import { selectAccessibleTasks } from "@/store/slices/permissionsSelectors";
import type { Task, TaskPriority, TaskStatus } from "@/types/tasks-system/task";

export function useTasks() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const isLoading = useAppSelector(selectTasksLoading);
  const error = useAppSelector(selectTasksError);
  const filters = useAppSelector(selectTaskFilters);
  const sorting = useAppSelector(selectTaskSorting);
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const accessibleTasks = useAppSelector(selectAccessibleTasks);

  const fetchAllTasks = () => dispatch(fetchTasks());
  const fetchSharedTasksAction = () => dispatch(fetchSharedTasks());
  const createNewTask = (task: Partial<Task>) => dispatch(createTask(task));
  const editTask = (data: Partial<Task> & { id: string }) =>
    dispatch(updateTask(data));
  const removeTask = (id: string) => dispatch(deleteTask(id));

  const toggleFavorite = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      dispatch(updateTask({ id, favorite: !task.favorite }));
    }
  };

  const filterByStatus = (status: "all" | TaskStatus) =>
    dispatch(setStatusFilter(status));
  const filterByList = (listId: string | null) =>
    dispatch(setListFilter(listId));
  const filterByPriority = (priority: "all" | TaskPriority) =>
    dispatch(setPriorityFilter(priority));
  const filterByFavorite = (favorite: "all" | "yes" | "no") =>
    dispatch(setFavoriteFilter(favorite));
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

  return {
    tasks,
    filteredTasks,
    accessibleTasks,
    isLoading,
    error,
    filters,
    sorting,
    fetchAllTasks,
    fetchSharedTasks: fetchSharedTasksAction,
    createTask: createNewTask,
    editTask,
    removeTask,
    toggleFavorite,
    filterByStatus,
    filterByList,
    filterByPriority,
    filterByFavorite,
    sortBy,
    toggleSort,
    shareTask,
    updateShare,
    removeShare,
  };
}
