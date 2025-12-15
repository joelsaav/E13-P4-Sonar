import {
  ShareDialog,
  type ShareCollaborator,
} from "@/components/shared/ShareDialog";
import { useTasks } from "@/hooks/tasks/useTasks";
import type { Task } from "@/types/tasks-system/task";

interface ShareTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export default function ShareTaskDialog({
  open,
  onOpenChange,
  task,
}: ShareTaskDialogProps) {
  const { shareTask, removeShare, updateShare, isLoading } = useTasks();

  const handleShare = async (email: string, permission: string) => {
    await shareTask(task.id, email, permission);
  };

  const handleRemoveShare = async (userId: string) => {
    await removeShare(task.id, userId);
  };

  const handleUpdateShare = (userId: string, permission: string) => {
    updateShare(task.id, userId, permission);
  };

  const shares: ShareCollaborator[] =
    task.shares?.map((s) => ({
      id: s.id,
      permission: s.permission,
      userId: s.userId,
      user: s.user,
    })) || [];

  return (
    <ShareDialog
      open={open}
      onOpenChange={onOpenChange}
      item={{ id: task.id, name: task.name }}
      type="task"
      shares={shares}
      onShare={handleShare}
      onRemoveShare={handleRemoveShare}
      onUpdateShare={handleUpdateShare}
      isLoading={isLoading}
    />
  );
}
