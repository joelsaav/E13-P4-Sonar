import { useMemo } from "react";
import { useTasks } from "./useTasks";
import { useLists } from "@/hooks/useLists";

export function useTaskFilters() {
  const {
    accessibleTasks,
    filteredTasks,
    filterByList,
    filterByStatus,
    filterByPriority,
    filterByFavorite,
    filters,
    sortBy,
    toggleSort,
    sorting,
  } = useTasks();
  const { accessibleLists } = useLists();

  const selectedListId = filters.listId;
  const listTaskCounts = useMemo(
    () =>
      accessibleLists.map((list) => ({
        id: list.id,
        name: list.name,
        count: accessibleTasks.filter((task) => task.listId === list.id).length,
        description: list.description,
        owner: list.owner,
      })),
    [accessibleLists, accessibleTasks],
  );

  const handleListFilter = (listId: string | null) => {
    filterByList(listId);
  };

  return {
    displayTasks: filteredTasks,
    listTaskCounts,
    selectedListId,
    handleListFilter,
    filterByStatus,
    filterByPriority,
    filterByFavorite,
    filters,
    sortBy,
    toggleSort,
    sorting,
    accessibleLists,
  };
}
