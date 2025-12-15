import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { CreateListDialogStandalone } from "../lists/CreateListDialog";
import { Button } from "@/components/ui/button";
import { ItemActionsMenu } from "@/components/shared/ItemActionsMenu";
import { useLists } from "@/hooks/useLists";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import EditListDialog from "../lists/EditListDialog";
import ShareListDialog from "../lists/ShareListDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/auth/auth";

interface FilterableListProps {
  title: string;
  items: Array<{
    id: string;
    name: string;
    count: number;
    description?: string;
    owner?: User;
  }>;
  selectedId: string | null;
  onItemClick: (id: string | null) => void;
  emptyMessage: string;
  icon: string;
  isLoading?: boolean;
  showAddButton?: boolean;
}

export function FilterableList({
  title,
  items,
  selectedId,
  onItemClick,
  emptyMessage,
  icon,
  isLoading,
  showAddButton = true,
}: FilterableListProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { lists, removeList, isOwner, removeShare } = useLists();
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [sharingListId, setSharingListId] = useState<string | null>(null);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [unsharingListId, setUnsharingListId] = useState<string | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getList = (id: string) => lists.find((l) => l.id === id);

  return (
    <div>
      {editingListId && getList(editingListId) && (
        <EditListDialog
          open={!!editingListId}
          onOpenChange={(open) => !open && setEditingListId(null)}
          list={getList(editingListId)!}
        />
      )}

      {sharingListId && getList(sharingListId) && (
        <ShareListDialog
          open={!!sharingListId}
          onOpenChange={(open) => !open && setSharingListId(null)}
          list={getList(sharingListId)!}
        />
      )}

      <AlertDialog
        open={!!deletingListId}
        onOpenChange={(open) => !open && setDeletingListId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("lists.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("lists.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("lists.delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deletingListId) {
                  try {
                    await removeList(deletingListId).unwrap();
                    setDeletingListId(null);
                  } catch (err) {
                    setErrorMessage(err as string);
                    setErrorDialogOpen(true);
                    setDeletingListId(null);
                  }
                }
              }}
            >
              {t("lists.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!unsharingListId}
        onOpenChange={(open) => !open && setUnsharingListId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.leave")}</DialogTitle>
            <DialogDescription>
              {t("share.leaveListConfirmation")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnsharingListId(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (unsharingListId && user?.id) {
                  try {
                    await removeShare(unsharingListId, user.id).unwrap();
                    setUnsharingListId(null);
                  } catch (err) {
                    setErrorMessage(err as string);
                    setErrorDialogOpen(true);
                    setUnsharingListId(null);
                  }
                }
              }}
            >
              {t("common.leave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <div className="flex flex-row items-center justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        {showAddButton && (
          <div className="flex gap-2">
            <CreateListDialogStandalone>
              <Button leftIcon="IconList" />
            </CreateListDialogStandalone>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:gap-2 mx-auto">
        {isLoading ? (
          [...new Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 rounded-md border animate-pulse bg-muted"
            >
              <div className="h-5 w-5 bg-muted rounded-full" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          items.map((item) => {
            const isItemOwner = isOwner(item.id);
            const listData = getList(item.id);
            const myShare = listData?.shares?.find(
              (s) => s.userId === user?.id,
            );
            const myPermission = myShare?.permission;
            const canEditList =
              isItemOwner ||
              myPermission === "EDIT" ||
              myPermission === "ADMIN";
            const canDeleteList = isItemOwner || myPermission === "ADMIN";
            const canShareList = isItemOwner || myPermission === "ADMIN";
            const canUnshareList = !isItemOwner && !!myShare;

            const showMenu =
              canEditList || canDeleteList || canShareList || canUnshareList;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  onItemClick(selectedId === item.id ? null : item.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onItemClick(selectedId === item.id ? null : item.id);
                  }
                }}
                className={`group flex items-center justify-between gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200 border active:scale-[0.99] ${
                  selectedId === item.id
                    ? "bg-primary text-secondary font-medium shadow-sm"
                    : "bg-card dark:bg-card border-border/50 hover:border-primary/30 hover:bg-muted hover:shadow-sm hover:shadow-primary/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Icon
                    as={icon}
                    size={18}
                    className={
                      selectedId === item.id
                        ? "text-secondary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }
                  />
                  <div className="flex flex-col gap-0">
                    <span className="font-medium truncate">{item.name}</span>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.owner && item.owner.id !== user?.id && (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={item.owner.image || undefined} />
                      <AvatarFallback className="text-[8px]">
                        {item.owner.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <Badge
                    variant={selectedId === item.id ? "secondary" : "default"}
                    className="justify-center rounded-full"
                  >
                    {item.count}
                  </Badge>

                  {showMenu && (
                    <div
                      role="presentation"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <ItemActionsMenu
                        onEdit={
                          canEditList
                            ? () => setEditingListId(item.id)
                            : undefined
                        }
                        onShare={
                          canShareList
                            ? () => setSharingListId(item.id)
                            : undefined
                        }
                        onDelete={
                          canDeleteList
                            ? () => setDeletingListId(item.id)
                            : undefined
                        }
                        onUnshare={
                          canUnshareList
                            ? () => setUnsharingListId(item.id)
                            : undefined
                        }
                        align="end"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
