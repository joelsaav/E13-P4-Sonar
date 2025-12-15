import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TaskCardHeader } from "@/components/tasks/cards/TaskCardHeader";
import { TaskCardContent } from "@/components/tasks/cards/TaskCardContent";
import {
  DeleteTaskDialog,
  TaskErrorDialog,
  TaskCompletionDialog,
} from "@/components/tasks/cards/TaskCardDialogs";
import CreateTaskDialog from "@/components/tasks/dialogs/CreateTaskDialog";
import ShareTaskDialog from "@/components/tasks/dialogs/ShareTaskDialog";
import { useTasks } from "@/hooks/tasks/useTasks";
import type { Task } from "@/types/tasks-system/task";
import type { List } from "@/types/tasks-system/list";

interface TaskCardProps {
  task: Task;
  list?: List;
  formatDate: (dateString?: string) => string;
}

export const TaskCard = memo(function TaskCard({
  task,
  formatDate,
}: TaskCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toggleFavorite, removeTask, editTask } = useTasks();

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

  return (
    <Card
      id={task.id}
      className="py-0 group relative flex flex-col border border-border/50 bg-gradient-to-br from-card via-card to-card/80 hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5 transition-all duration-300 overflow-hidden rounded-xl backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardContent className="relative flex flex-col gap-4 w-full p-4 sm:p-5">
        <TaskCardHeader
          status={task.status}
          priority={task.priority}
          favorite={task.favorite}
          canEdit={true}
          actions={{
            onShare: () => setShareDialogOpen(true),
            onEdit: () => setEditDialogOpen(true),
            onDelete: () => setDeleteDialogOpen(true),
            align: "start",
          }}
          onStatusChange={(status) => editTask({ id: task.id, status })}
          onPriorityChange={(priority) => editTask({ id: task.id, priority })}
          onFavoriteToggle={() => toggleFavorite(task.id)}
          onStatusComplete={() => setCompletionDialogOpen(true)}
          showFavorite={true}
        />

        <TaskCardContent
          name={task.name}
          description={task.description}
          createdAt={task.createdAt}
          dueDate={task.dueDate}
          formatDate={formatDate}
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
