import { useState, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ItemActionsMenu } from "@/components/ui/ItemActionsMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Icon from "@/components/ui/icon";
import CreateTaskDialog from "@/components/createDialogs/createTaskDialog";
import ShareTaskDialog from "./ShareTaskDialog";
import { priorityConfig, statusConfig } from "@/config/taskConfig";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import type { Task, TaskStatus, TaskPriority } from "@/types/tasks-system/task";
import type { List } from "@/types/tasks-system/list";
import type { SharePermission } from "@/types/permissions";

interface SharedTaskCardProps {
  task: Task;
  list?: List;
  formatDate: (dateString?: string) => string;
}

export const SharedTaskCard = memo(function SharedTaskCard({
  task,
  list,
  formatDate,
}: SharedTaskCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const priorityStyle = priorityConfig[task.priority];
  const statusStyle = statusConfig[task.status];
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { removeTask, editTask } = useTasks();

  // Calculate permission
  let permission: SharePermission = "VIEW";
  const myId = user?.id;
  const taskShare = task.shares?.find((s) => s.userId === myId);
  const listShare = list?.shares?.find((s) => s.userId === myId);

  if (taskShare) permission = taskShare.permission;
  else if (listShare) permission = listShare.permission;

  const canEdit = permission === "EDIT" || permission === "ADMIN";
  const canDelete = permission === "ADMIN";
  const canShare = permission === "ADMIN";

  // Determine owner
  const owner = task.list?.owner || list?.owner;

  const handleShare = () => {
    if (canShare) {
      setShareDialogOpen(true);
    } else {
      setErrorMessage(t("share.errors.noSharePermission"));
      setErrorDialogOpen(true);
    }
  };

  const handleEdit = () => {
    if (canEdit) {
      setEditDialogOpen(true);
    } else {
      setErrorMessage(t("share.errors.noEditPermission"));
      setErrorDialogOpen(true);
    }
  };

  const handleDelete = () => {
    if (canDelete) {
      setDeleteDialogOpen(true);
    } else {
      setErrorMessage(t("share.errors.noDeletePermission"));
      setErrorDialogOpen(true);
    }
  };

  return (
    <Card className="group relative flex flex-col shadow-none border border-border/40 bg-card hover:shadow-sm transition-all duration-200 overflow-hidden rounded-xl">
      <CardContent className="flex flex-col gap-4 w-full">
        {/* Top Section: Actions (Left) and Status/Priority (Right) */}
        <div className="flex justify-between items-center w-full">
          {/* Actions Menu (Left) */}
          <div className="flex items-center gap-2">
            <ItemActionsMenu
              onShare={handleShare}
              onEdit={handleEdit}
              onDelete={handleDelete}
              align="start"
            />
          </div>

          {/* Status, Priority (Right) */}
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="focus:outline-none"
                  disabled={!canEdit}
                >
                  <Badge
                    variant="outline"
                    className={`${statusStyle.color} ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-80"} transition-opacity`}
                    leftIcon="IconCircle"
                  >
                    {statusStyle.label}
                  </Badge>
                </DropdownMenuTrigger>
                {canEdit && (
                  <DropdownMenuContent align="end">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() =>
                          editTask({ id: task.id, status: key as TaskStatus })
                        }
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

              <DropdownMenu>
                <DropdownMenuTrigger
                  className="focus:outline-none"
                  disabled={!canEdit}
                >
                  <Badge
                    variant="outline"
                    className={`${priorityStyle.color} ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-80"} transition-opacity`}
                    leftIcon="IconFlag"
                  >
                    {priorityStyle.label}
                  </Badge>
                </DropdownMenuTrigger>
                {canEdit && (
                  <DropdownMenuContent align="end">
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() =>
                          editTask({
                            id: task.id,
                            priority: key as TaskPriority,
                          })
                        }
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
            </div>
          </div>
        </div>

        {/* Middle Section: Title & Description */}
        <div className="flex-1 flex flex-col justify-center text-left">
          <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {task.name}
          </h3>

          {/* Dates and Owner */}
          <div className="flex flex-row justify-between items-center mt-1">
            <div className="flex flex-row gap-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon
                  as="IconCalendarPlus"
                  size={14}
                  className="text-muted-foreground shrink-0"
                />
                <span>{formatDate(task.createdAt)}</span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon
                    as="IconCalendarEvent"
                    size={14}
                    className="text-muted-foreground shrink-0"
                  />
                  <span>{task.dueDate ? formatDate(task.dueDate) : "-"}</span>
                </div>
              )}
            </div>

            {/* Owner Avatar */}
            {owner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 cursor-help">
                      <AvatarImage
                        src={owner.image || undefined}
                        alt={owner.name}
                      />
                      <AvatarFallback className="text-[10px]">
                        {owner.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {t("share.sharedBy", {
                        name: owner.name,
                        email: owner.email,
                      })}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {task.description && (
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
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

      {/* Error Alert Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("share.errors.actionNotAllowed")}
            </AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              {t("share.errors.understood")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
});
