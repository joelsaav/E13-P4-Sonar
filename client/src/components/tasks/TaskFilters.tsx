import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { statusConfig, priorityConfig } from "@/config/taskConfig";
import type { TaskStatus, TaskPriority } from "@/types/tasks-system/task";

// Types
interface FilterProps<T> {
  value: T | "all";
  onChange: (value: T | "all") => void;
  showAll?: boolean;
  variant?: "default" | "compact";
  className?: string;
}

interface TaskFilterConfig {
  placeholder: string;
  allLabel: string;
  config: Record<string, { color: string; labelKey: string }>;
  icon?: string;
}

// Base TaskFilter Component
function TaskFilter<T extends string>({
  value,
  onChange,
  showAll = true,
  variant = "default",
  className = "",
  filterConfig,
}: FilterProps<T> & { filterConfig: TaskFilterConfig }) {
  const { t } = useTranslation();
  const currentConfig = value !== "all" ? filterConfig.config[value] : null;
  const currentLabel = currentConfig ? t(currentConfig.labelKey) : null;

  if (variant === "compact") {
    return (
      <Select value={value} onValueChange={(val) => onChange(val as T | "all")}>
        <SelectTrigger
          className={`!h-auto !w-auto !p-0 !border-0 !bg-transparent !shadow-none !outline-none !ring-0 focus:!ring-0 focus-visible:!ring-0 focus-visible:!border-0 [&>svg]:hidden ${className}`}
        >
          <Badge
            variant="outline"
            className={`${currentConfig?.color || ""} cursor-pointer hover:opacity-80 transition-opacity`}
            leftIcon={filterConfig.icon}
            rightIcon="IconChevronDown"
          >
            {currentLabel || filterConfig.placeholder}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          {showAll && (
            <SelectItem value="all">{filterConfig.allLabel}</SelectItem>
          )}
          {Object.entries(filterConfig.config).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              <Badge
                variant="outline"
                className={config.color}
                leftIcon={filterConfig.icon}
              >
                {t(config.labelKey)}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Default variant
  return (
    <Select value={value} onValueChange={(val) => onChange(val as T | "all")}>
      <SelectTrigger className={`h-8 text-sm ${className}`}>
        <SelectValue placeholder={filterConfig.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAll && (
          <SelectItem value="all">{filterConfig.allLabel}</SelectItem>
        )}
        {Object.entries(filterConfig.config).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            <Badge
              variant="outline"
              className={config.color}
              leftIcon={filterConfig.icon}
            >
              {t(config.labelKey)}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Status Filter
export function TaskStatusFilter(props: FilterProps<TaskStatus>) {
  const { t } = useTranslation();

  const statusConfigWithKeys = Object.fromEntries(
    Object.entries(statusConfig).map(([key, value]) => [
      key,
      { color: value.color, labelKey: `tasks.status.${key}` },
    ]),
  );

  return (
    <TaskFilter
      {...props}
      filterConfig={{
        placeholder: t("tasks.filters.statusPlaceholder"),
        allLabel: t("tasks.filters.statusAll"),
        config: statusConfigWithKeys,
        icon: "IconCircle",
      }}
    />
  );
}

// Priority Filter
export function TaskPriorityFilter(props: FilterProps<TaskPriority>) {
  const { t } = useTranslation();

  const priorityConfigWithKeys = Object.fromEntries(
    Object.entries(priorityConfig).map(([key, value]) => [
      key,
      { color: value.color, labelKey: `tasks.priority.${key}` },
    ]),
  );

  return (
    <TaskFilter
      {...props}
      filterConfig={{
        placeholder: t("tasks.filters.priorityPlaceholder"),
        allLabel: t("tasks.filters.priorityAll"),
        config: priorityConfigWithKeys,
        icon: "IconFlag",
      }}
    />
  );
}

// Sort Filter Types
type SortField = "name" | "dueDate" | "priority" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

interface TaskSortFilterProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSortFieldChange: (field: SortField) => void;
  onToggleOrder: () => void;
  className?: string;
}

// Sort Filter Component
export function TaskSortFilter({
  sortField,
  sortOrder,
  onSortFieldChange,
  onToggleOrder,
  className = "",
}: TaskSortFilterProps) {
  const { t } = useTranslation();

  const sortFields: Record<string, string> = {
    dueDate: t("tasks.filters.sortFields.dueDate"),
    createdAt: t("tasks.filters.sortFields.createdAt"),
    name: t("tasks.filters.sortFields.name"),
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select
        value={sortField}
        onValueChange={(value) => onSortFieldChange(value as SortField)}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder={t("tasks.filters.sortPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(sortFields).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        onClick={onToggleOrder}
        title={
          sortOrder === "asc"
            ? t("tasks.filters.sortOrder.asc")
            : t("tasks.filters.sortOrder.desc")
        }
        leftIcon={
          sortOrder === "asc" ? "IconSortAscending" : "IconSortDescending"
        }
      />
    </div>
  );
}
