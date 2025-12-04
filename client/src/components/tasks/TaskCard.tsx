import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ItemActionsMenu } from "@/components/ui/ItemActionsMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { Checkbox } from "@/components/customized/checkbox/checkbox-09";
import CreateTaskDialog from "@/components/createDialogs/createTaskDialog";
import ShareTaskDialog from "./ShareTaskDialog";
import { useTranslation } from "react-i18next";

import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types/tasks-system/task";
import type { List } from "@/types/tasks-system/list";
import {
  TaskStatusFilter,
  TaskPriorityFilter,
} from "@/components/tasks/TaskFilters";

interface TaskCardProps {
  task: Task;
  list?: List;
  formatDate: (dateString?: string) => string;
}

export const TaskCard = memo(function TaskCard({
  task,
  formatDate,
}: TaskCardProps) {
  const { t } = useTranslation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toggleFavorite, removeTask, editTask } = useTasks();

  return (
    <Card id={task.id} className="py-0 group relative flex flex-col shadow-none border border-border bg-card hover:shadow-sm transition-all duration-200 overflow-hidden rounded-xl">
      <CardContent className="flex flex-col gap-4 w-full p-4 sm:p-6">
        {/* Top Section: Actions (Left) and Status/Priority/Favorite (Right) */}
        <div className="flex flex-wrap justify-between items-center sm:items-center w-full gap-2 sm:gap-0">
          {/* Actions Menu (Left) */}
          <ItemActionsMenu
            onShare={() => setShareDialogOpen(true)}
            onEdit={() => setEditDialogOpen(true)}
            onDelete={() => setDeleteDialogOpen(true)}
            align="start"
          />

          <div className="flex flex-row flex-wrap justify-end items-center gap-1 sm:gap-1">
            {/* Status Filter */}
            <TaskStatusFilter
              variant="compact"
              value={task.status}
              onChange={(status) => {
                if (status !== "all") {
                  editTask({ id: task.id, status });
                }
              }}
              showAll={false}
            />

            {/* Priority Filter */}
            <TaskPriorityFilter
              variant="compact"
              value={task.priority}
              onChange={(priority) => {
                if (priority !== "all") {
                  editTask({ id: task.id, priority });
                }
              }}
              showAll={false}
            />

            {/* Favorite Checkbox */}
            <Checkbox
              checked={task.favorite}
              onCheckedChange={() => toggleFavorite(task.id)}
              className="ml-2 sm:ml-2 cursor-pointer hover:scale-110 transition-transform duration-200"
              icon={
                <Icon
                  as="IconStar"
                  size={16}
                  className="text-muted-foreground hover:text-yellow-400 transition-colors duration-200"
                />
              }
              checkedIcon={
                <Icon
                  as="IconStar"
                  size={16}
                  className="fill-yellow-400 text-yellow-400"
                />
              }
            />
          </div>
        </div>

        {/* Left Section: Title & Description */}
        <div className="flex-1 flex flex-col justify-center text-left">
          <h3 className="text-base sm:text-base md:text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors break-words">
            {task.name}
          </h3>

          {/* Dates */}
          <div className="flex flex-col xs:flex-row gap-1.5 mt-1">
            <div className="flex items-center gap-1.5 text-xs sm:text-xs md:text-sm text-muted-foreground">
              <Icon
                as="IconCalendarPlus"
                size={14}
                className="text-muted-foreground shrink-0"
              />
              <span className="truncate max-w-[120px] sm:max-w-none">
                {formatDate(task.createdAt)}
              </span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1.5 text-xs sm:text-xs md:text-sm text-muted-foreground">
                <Icon
                  as="IconCalendarEvent"
                  size={14}
                  className="text-muted-foreground shrink-0"
                />
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {task.dueDate ? formatDate(task.dueDate) : "-"}
                </span>
              </div>
            )}
          </div>
          {task.description && (
            <p className="mt-1.5 text-sm sm:text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed break-words">
              {task.description}
            </p>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <CreateTaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editTask={task}
      />

      {/* Share Dialog */}
      <ShareTaskDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        task={task}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("tasks.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("tasks.delete.description", { name: task.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("tasks.delete.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                removeTask(task.id);
                setDeleteDialogOpen(false);
              }}
            >
              {t("tasks.delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
});
