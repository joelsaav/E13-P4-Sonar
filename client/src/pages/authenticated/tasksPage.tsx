import { useEffect, useCallback } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useLists } from "@/hooks/useLists";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { TaskCard } from "@/components/tasks/TaskCard";
import { FilterableList } from "@/components/tasks/FilterableList";
import { useTranslation } from "react-i18next";
import CreateTaskDialog from "@/components/createDialogs/createTaskDialog";
import { Button } from "@/components/ui/button";
import {
  TaskStatusFilter,
  TaskPriorityFilter,
  TaskSortFilter,
} from "@/components/tasks/TaskFilters";
import type { Task } from "@/types/tasks-system/task";
import { useUI } from "@/hooks/useUI";

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
    filters,
    sortBy,
    toggleSort,
    sorting,
  } = useTaskFilters();

  const { fetchAllTasks, isLoading } = useTasks();
  const { fetchAllLists, isLoading: isLoadingLists } = useLists();
  const { sidebarWidth } = useUI();

  const layoutConfig = {
    compact: {
      sidebar: "lg:w-64",
      grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      skeletonCount: 8,
    },
    normal: {
      sidebar: "lg:w-80",
      grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3",
      skeletonCount: 6,
    },
    wide: {
      sidebar: "lg:w-96",
      grid: "grid-cols-1 lg:grid-cols-2",
      skeletonCount: 4,
    },
  }[sidebarWidth];

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
    <div className="container mx-auto py-8 px-4 lg:px-8 flex flex-col lg:flex-row items-start gap-8">
      <aside
        className={`w-full shrink-0 order-1 lg:order-2 ${layoutConfig.sidebar} space-y-8`}
      >
        <FilterableList
          title={t("lists.sidebar.title")}
          items={listTaskCounts}
          selectedId={selectedListId}
          onItemClick={handleListFilter}
          emptyMessage={t("lists.emptyState")}
          icon="IconList"
          isLoading={isLoadingLists}
        />
      </aside>

      <div className="flex-1 min-w-0 w-full order-2 lg:order-1">
        <div className="mb-6 space-y-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90">
                {t("tasks.title")}
              </h1>
            </div>
            <div className="flex gap-2">
              {/* Boton de crear tareas */}
              <CreateTaskDialog>
                <Button leftIcon="IconTask" />
              </CreateTaskDialog>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-card p-2 rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <TaskStatusFilter
                value={filters.status}
                onChange={filterByStatus}
                className="w-full"
              />

              <TaskPriorityFilter
                value={filters.priority}
                onChange={filterByPriority}
                className="w-full"
              />
            </div>

            <div>
              <TaskSortFilter
                sortField={sorting.field}
                sortOrder={sorting.order}
                onSortFieldChange={(field) => sortBy(field, sorting.order)}
                onToggleOrder={toggleSort}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={`grid ${layoutConfig.grid} gap-6`}>
            {[...Array(layoutConfig.skeletonCount)].map((_, i) => (
              <div
                key={i}
                className="rounded-md border p-4 h-[160px] animate-pulse bg-muted/20"
              >
                <div className="h-6 w-1/3 bg-muted rounded mb-4" />
                <div className="h-4 w-2/3 bg-muted rounded mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("tasks.emptyState")}</p>
          </div>
        ) : (
          <div className={`grid ${layoutConfig.grid} gap-6`}>
            {displayTasks.map((task: Task) => {
              const list = accessibleLists.find(
                (list) => list.id === task.listId,
              );
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  list={list}
                  formatDate={formatDate}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
