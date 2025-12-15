import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ItemActionsMenu } from "@/components/shared/ItemActionsMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/icon";
import { priorityConfig, statusConfig } from "@/config/taskConfig";
import type { TaskStatus, TaskPriority } from "@/types/tasks-system/task";

interface TaskCardActionsProps {
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onUnshare?: () => void;
  align?: "start" | "end" | "center";
}

interface StatusDropdownProps {
  status: TaskStatus;
  canEdit: boolean;
  onStatusChange: (status: TaskStatus) => void;
  onStatusComplete?: () => void;
}

interface PriorityDropdownProps {
  priority: TaskPriority;
  canEdit: boolean;
  onPriorityChange: (priority: TaskPriority) => void;
}

interface FavoriteCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

interface TaskCardHeaderProps {
  status: TaskStatus;
  priority: TaskPriority;
  favorite?: boolean;
  canEdit?: boolean;
  actions?: TaskCardActionsProps;
  onStatusChange?: (status: TaskStatus) => void;
  onPriorityChange?: (priority: TaskPriority) => void;
  onFavoriteToggle?: () => void;
  onStatusComplete?: () => void;
  showFavorite?: boolean;
}

export const StatusDropdown = memo(function StatusDropdown({
  status,
  canEdit,
  onStatusChange,
  onStatusComplete,
}: StatusDropdownProps) {
  const statusStyle = statusConfig[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" disabled={!canEdit}>
        <Badge
          variant="outline"
          className={`${statusStyle.color} ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-80"} transition-opacity`}
          leftIcon="IconCircle"
          rightIcon={canEdit ? "IconChevronDown" : undefined}
        >
          {statusStyle.label}
        </Badge>
      </DropdownMenuTrigger>
      {canEdit && (
        <DropdownMenuContent align="end">
          {Object.entries(statusConfig).map(([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => {
                onStatusChange(key as TaskStatus);
                if (key === "COMPLETED" && status !== "COMPLETED") {
                  onStatusComplete?.();
                }
              }}
              className="flex items-center gap-2"
            >
              <div
                className={`w-2 h-2 rounded-full ${config.color.replace("bg-", "bg-").replace("/10", "")} bg-current opacity-70`}
              />
              {config.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
});

export const PriorityDropdown = memo(function PriorityDropdown({
  priority,
  canEdit,
  onPriorityChange,
}: PriorityDropdownProps) {
  const priorityStyle = priorityConfig[priority];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" disabled={!canEdit}>
        <Badge
          variant="outline"
          className={`${priorityStyle.color} ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-80"} transition-opacity`}
          leftIcon="IconFlag"
          rightIcon={canEdit ? "IconChevronDown" : undefined}
        >
          {priorityStyle.label}
        </Badge>
      </DropdownMenuTrigger>
      {canEdit && (
        <DropdownMenuContent align="end">
          {Object.entries(priorityConfig).map(([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onPriorityChange(key as TaskPriority)}
              className="flex items-center gap-2"
            >
              <div
                className={`w-2 h-2 rounded-full ${config.color.replace("bg-", "bg-").replace("/10", "")} bg-current opacity-70`}
              />
              {config.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
});

export const FavoriteCheckbox = memo(function FavoriteCheckbox({
  checked,
  onToggle,
}: FavoriteCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onToggle}
      className="ml-2 sm:ml-2 cursor-pointer hover:scale-110 transition-transform duration-200"
      icon={
        <Icon
          as="IconStar"
          size={16}
          className="fill-none text-muted-foreground"
        />
      }
      checkedIcon={
        <Icon
          as="IconStarFilled"
          size={16}
          className="fill-primary text-primary"
        />
      }
    />
  );
});

export const TaskCardHeader = memo(function TaskCardHeader({
  status,
  priority,
  favorite = false,
  canEdit = true,
  actions,
  onStatusChange,
  onPriorityChange,
  onFavoriteToggle,
  onStatusComplete,
  showFavorite = true,
}: TaskCardHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-center sm:items-center w-full gap-2 sm:gap-0">
      <div className="flex items-center gap-2">
        {actions && (
          <ItemActionsMenu
            onShare={actions.onShare}
            onEdit={actions.onEdit}
            onDelete={actions.onDelete}
            onUnshare={actions.onUnshare}
            align={actions.align || "start"}
          />
        )}
      </div>

      <div className="flex flex-row flex-wrap justify-end items-center gap-1 sm:gap-1">
        {onStatusChange && (
          <StatusDropdown
            status={status}
            canEdit={canEdit}
            onStatusChange={onStatusChange}
            onStatusComplete={onStatusComplete}
          />
        )}

        {onPriorityChange && (
          <PriorityDropdown
            priority={priority}
            canEdit={canEdit}
            onPriorityChange={onPriorityChange}
          />
        )}

        {showFavorite && onFavoriteToggle && (
          <FavoriteCheckbox checked={favorite} onToggle={onFavoriteToggle} />
        )}
      </div>
    </div>
  );
});
