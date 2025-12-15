import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TaskCardHeader } from "@/components/tasks/cards/TaskCardHeader";
import { TaskCardContent } from "@/components/tasks/cards/TaskCardContent";
import {
  DeleteTaskDialog,
  UnshareTaskDialog,
  TaskErrorDialog,
  TaskCompletionDialog,
} from "@/components/tasks/cards/TaskCardDialogs";
import CreateTaskDialog from "@/components/tasks/dialogs/CreateTaskDialog";
import ShareTaskDialog from "@/components/tasks/dialogs/ShareTaskDialog";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [unshareDialogOpen, setUnshareDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { removeTask, editTask, removeShare } = useTasks();

  const myId = user?.id;
  const taskShare = task.shares?.find((s) => s.userId === myId);
  const listShare = list?.shares?.find((s) => s.userId === myId);
  let permission: SharePermission = "VIEW";
  if (taskShare) permission = taskShare.permission;
  else if (listShare) permission = listShare.permission;

  const canEdit = permission === "EDIT" || permission === "ADMIN";
  const owner = task.list?.owner || list?.owner;
  const isOwner = owner?.id === myId;
  const isListSharedWithMe = list?.shares?.some((s) => s.userId === myId);
  const listPermission = listShare?.permission;
  const canDeleteTask = isOwner || listPermission === "ADMIN";
  const canShareTask = isOwner || permission === "ADMIN";

  const handleDelete = async () => {
    try {
      await removeTask(task.id).unwrap();
      setDeleteDialogOpen(false);
    } catch (err) {
      setErrorMessage(err as string);
      setErrorDialogOpen(true);
      setDeleteDialogOpen(false);
    }
  };

  const handleUnshare = async () => {
    if (myId) {
      try {
        await removeShare(task.id, myId).unwrap();
        setUnshareDialogOpen(false);
      } catch (err) {
        setErrorMessage(err as string);
        setErrorDialogOpen(true);
        setUnshareDialogOpen(false);
      }
    }
  };

  return (
    <Card className="py-0 group relative flex flex-col border border-border/50 bg-gradient-to-br from-card via-card to-card/80 hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5 transition-all duration-300 overflow-hidden rounded-xl backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardContent className="relative flex flex-col gap-4 w-full p-4 sm:p-5">
        <div className="flex justify-between items-center w-full">
          <TaskCardHeader
            status={task.status}
            priority={task.priority}
            canEdit={canEdit}
            actions={{
              onShare: canShareTask
                ? () => setShareDialogOpen(true)
                : undefined,
              onEdit: canEdit ? () => setEditDialogOpen(true) : undefined,
              onDelete: canDeleteTask
                ? () => setDeleteDialogOpen(true)
                : undefined,
              onUnshare:
                !isOwner && !isListSharedWithMe
                  ? () => setUnshareDialogOpen(true)
                  : undefined,
              align: "start",
            }}
            onStatusChange={(status: TaskStatus) =>
              editTask({ id: task.id, status })
            }
            onPriorityChange={(priority: TaskPriority) =>
              editTask({ id: task.id, priority })
            }
            onStatusComplete={() => setCompletionDialogOpen(true)}
            showFavorite={false}
          />
        </div>

        <TaskCardContent
          name={task.name}
          description={task.description}
          createdAt={task.createdAt}
          dueDate={task.dueDate}
          formatDate={formatDate}
          owner={owner}
          showOwner={true}
        />
      </CardContent>

      <CreateTaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editTask={task}
      />

      <ShareTaskDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        task={task}
      />

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        taskName={task.name}
        onConfirm={handleDelete}
      />

      <UnshareTaskDialog
        open={unshareDialogOpen}
        onOpenChange={setUnshareDialogOpen}
        taskName={task.name}
        onConfirm={handleUnshare}
      />

      <TaskErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        errorMessage={errorMessage}
      />

      <TaskCompletionDialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
      />
    </Card>
  );
});
