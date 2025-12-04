import { useEffect, useCallback } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useLists } from "@/hooks/useLists";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { SharedTaskCard } from "@/components/tasks/SharedTaskCard";
import { FilterableList } from "@/components/tasks/FilterableList";
import { useTranslation } from "react-i18next";
import {
  TaskStatusFilter,
  TaskPriorityFilter,
  TaskSortFilter,
} from "@/components/tasks/TaskFilters";
import type { Task } from "@/types/tasks-system/task";
import { useUI } from "@/hooks/useUI";

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
  const { fetchSharedLists, isLoading: isLoadingLists } = useLists();
  const { sidebarWidth, taskCardSize } = useUI();

  const sidebarWidthClass = {
    compact: "lg:max-w-xs",
    normal: "lg:max-w-md",
    wide: "lg:max-w-xl",
  }[sidebarWidth];

  const gridColsClass = {
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 lg:grid-cols-3",
    4: "grid-cols-1 lg:grid-cols-4",
  }[taskCardSize];

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
    <div className="max-w-(--breakpoint-2xl) mx-auto py-10 lg:py-16 px-6 xl:px-0 flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
      <aside
        className={`sticky top-8 shrink-0 ${sidebarWidthClass} w-full space-y-8 order-1 lg:order-2 lg:border-l lg:border-border lg:pl-12`}
      >
        <FilterableList
          title={t("shared.listsTitle")}
          items={listTaskCounts}
          selectedId={selectedListId}
          onItemClick={handleListFilter}
          emptyMessage={t("shared.listsEmptyState")}
          icon="IconList"
          isLoading={isLoadingLists}
        />
      </aside>

      <div className="flex-1 order-2 lg:order-1 w-full">
        <div className="mb-6 space-y-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90">
                {t("shared.title")}
              </h1>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-card p-2 rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <TaskStatusFilter
                value={filters.status}
                onChange={filterByStatus}
                className="w-full sm:w-[180px]"
              />

              <TaskPriorityFilter
                value={filters.priority}
                onChange={filterByPriority}
                className="w-full sm:w-[180px]"
              />
            </div>

            <div className="w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
              <TaskSortFilter
                sortField={sorting.field}
                sortOrder={sorting.order}
                onSortFieldChange={(field) => sortBy(field, sorting.order)}
                onToggleOrder={toggleSort}
                className="w-full sm:w-auto justify-between sm:justify-end"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={`grid ${gridColsClass} gap-6`}>
            {[...Array(taskCardSize * 2)].map((_, i) => (
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
            <p className="text-muted-foreground">{t("shared.emptyState")}</p>
          </div>
        ) : (
          <div className={`grid ${gridColsClass} gap-6`}>
            {displayTasks.map((task: Task) => {
              const list = accessibleLists.find(
                (list) => list.id === task.listId,
              );
              return (
                <SharedTaskCard
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
