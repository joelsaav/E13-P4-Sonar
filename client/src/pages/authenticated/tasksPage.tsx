import { useEffect, useCallback } from "react";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useLists } from "@/hooks/useLists";
import { useTaskFilters } from "@/hooks/tasks/useTaskFilters";
import { TaskCard } from "@/components/tasks/cards/TaskCard";
import { useTranslation } from "react-i18next";
import CreateTaskDialog from "@/components/tasks/dialogs/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { TasksPageLayout } from "@/components/tasks/TasksPageLayout";
import type { Task } from "@/types/tasks-system/task";

export default function TasksPage() {
  const { t, i18n } = useTranslation();
  const {
    displayTasks,
    listTaskCounts,
    selectedListId,
    handleListFilter,
    accessibleLists,
    filterByStatus,
    filterByPriority,
    filterByFavorite,
    filters,
    sortBy,
    toggleSort,
    sorting,
  } = useTaskFilters();

  const { fetchAllTasks, isLoading } = useTasks();
  const { fetchAllLists, isLoading: isLoadingLists } = useLists();

  useEffect(() => {
    fetchAllTasks();
    fetchAllLists();
  }, []);

  const formatDate = useCallback(
    (dateString?: string) => {
      if (!dateString) return t("tasks.card.noDate");
      const date = new Date(dateString);
      const locale = i18n.language === "es" ? "es-ES" : "en-US";
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
    [t, i18n.language],
  );

  return (
    <TasksPageLayout
      title={t("tasks.title")}
      headerActions={
        <CreateTaskDialog>
          <Button leftIcon="IconTask" />
        </CreateTaskDialog>
      }
      sidebarTitle={t("lists.sidebar.title")}
      sidebarActions={true}
      sidebarItems={listTaskCounts}
      selectedListId={selectedListId}
      onListClick={handleListFilter}
      isSidebarLoading={isLoadingLists}
      sidebarEmptyMessage={t("lists.emptyState")}
      filters={filters}
      onStatusChange={filterByStatus}
      onPriorityChange={filterByPriority}
      onFavoriteToggle={() =>
        filterByFavorite(filters.favorite === "yes" ? "all" : "yes")
      }
      sorting={sorting}
      onSortChange={(field) => sortBy(field, sorting.order)}
      onToggleSort={toggleSort}
      isLoadingTasks={isLoading}
      tasks={displayTasks}
      emptyTasksMessage={t("tasks.emptyState")}
      renderCard={(task: Task) => {
        const list = accessibleLists.find((list) => list.id === task.listId);
        return (
          <TaskCard
            key={task.id}
            task={task}
            list={list}
            formatDate={formatDate}
          />
        );
      }}
    />
  );
}
