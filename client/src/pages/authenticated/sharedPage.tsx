import { useEffect, useCallback } from "react";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useLists } from "@/hooks/useLists";
import { useTaskFilters } from "@/hooks/tasks/useTaskFilters";
import { SharedTaskCard } from "@/components/tasks/cards/SharedTaskCard";
import { useTranslation } from "react-i18next";
import { TasksPageLayout } from "@/components/tasks/TasksPageLayout";
import type { Task } from "@/types/tasks-system/task";
import { Button } from "@/components/ui/button";
import CreateTaskDialog from "@/components/tasks/dialogs/CreateTaskDialog";

export default function SharedPage() {
  const { t, i18n } = useTranslation();
  const {
    displayTasks,
    listTaskCounts,
    selectedListId,
    handleListFilter,
    accessibleLists,
    filterByStatus,
    filterByPriority,
    filters,
    sortBy,
    toggleSort,
    sorting,
  } = useTaskFilters();

  const { fetchSharedTasks, isLoading } = useTasks();
  const {
    fetchSharedLists,
    isLoading: isLoadingLists,
    isOwner,
    canAccess,
  } = useLists();

  useEffect(() => {
    fetchSharedTasks();
    fetchSharedLists();
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
      title={t("shared.title")}
      headerActions={
        <CreateTaskDialog filterByEditPermission={true} showCreateList={false}>
          <Button
            leftIcon="IconTask"
            disabled={
              !accessibleLists.some(
                (l) => isOwner(l.id) || canAccess(l.id, "EDIT"),
              )
            }
          />
        </CreateTaskDialog>
      }
      sidebarTitle={t("shared.listsTitle")}
      sidebarActions={false}
      sidebarItems={listTaskCounts}
      selectedListId={selectedListId}
      onListClick={handleListFilter}
      isSidebarLoading={isLoadingLists}
      sidebarEmptyMessage={t("shared.listsEmptyState")}
      filters={filters}
      onStatusChange={filterByStatus}
      onPriorityChange={filterByPriority}
      showFavoriteToggle={false}
      sorting={sorting}
      onSortChange={(field) => sortBy(field, sorting.order)}
      onToggleSort={toggleSort}
      isLoadingTasks={isLoading}
      tasks={displayTasks}
      emptyTasksMessage={t("shared.emptyState")}
      renderCard={(task: Task) => {
        const list = accessibleLists.find((list) => list.id === task.listId);
        return (
          <SharedTaskCard
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
