import {
  ShareDialog,
  type ShareCollaborator,
} from "@/components/shared/ShareDialog";
import { useLists } from "@/hooks/useLists";
import type { List } from "@/types/tasks-system/list";
import type { SharePermission } from "@/types/permissions";

interface ShareListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: List;
}

export default function ShareListDialog({
  open,
  onOpenChange,
  list,
}: Readonly<ShareListDialogProps>) {
  const { shareList, removeShare, updateShare, isLoading } = useLists();

  const handleShare = async (email: string, permission: string) => {
    await shareList(list.id, {
      id: "",
      permission: permission as SharePermission,
      listId: list.id,
      userId: "",
      user: { id: "", name: "", email, image: null },
    });
  };

  const handleRemoveShare = async (userId: string) => {
    await removeShare(list.id, userId);
  };

  const handleUpdateShare = (userId: string, permission: string) => {
    const share = list.shares?.find((s) => s.userId === userId);
    if (share) {
      updateShare(list.id, {
        ...share,
        permission: permission as SharePermission,
      });
    }
  };

  const shares: ShareCollaborator[] =
    list.shares?.map((s) => ({
      id: s.id,
      permission: s.permission,
      userId: s.userId,
      user: s.user,
    })) || [];

  return (
    <ShareDialog
      open={open}
      onOpenChange={onOpenChange}
      item={{ id: list.id, name: list.name }}
      type="list"
      shares={shares}
      onShare={handleShare}
      onRemoveShare={handleRemoveShare}
      onUpdateShare={handleUpdateShare}
      isLoading={isLoading}
    />
  );
}
