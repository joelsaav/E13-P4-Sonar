import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { CreateListDialogStandalone } from "../createDialogs/createListDialog";
import { Button } from "@/components/ui/button";
import { ItemActionsMenu } from "@/components/ui/ItemActionsMenu";
import { useLists } from "@/hooks/useLists";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import EditListDialog from "../createDialogs/editListDialog";
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

interface FilterableListProps {
  title: string;
  items: Array<{
    id: string;
    name: string;
    count: number;
    description?: string;
  }>;
  selectedId: string | null;
  onItemClick: (id: string | null) => void;
  emptyMessage: string;
  icon: string;
  isLoading?: boolean;
}

export function FilterableList({
  title,
  items,
  selectedId,
  onItemClick,
  emptyMessage,
  icon,
  isLoading,
}: FilterableListProps) {
  const { t } = useTranslation();
  const { lists, removeList, isOwner } = useLists();
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [sharingListId, setSharingListId] = useState<string | null>(null);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);

  const getList = (id: string) => lists.find((l) => l.id === id);

  return (
    <div>
      {/* Dialogs */}
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
              onClick={() => {
                if (deletingListId) {
                  removeList(deletingListId);
                  setDeletingListId(null);
                }
              }}
            >
              {t("lists.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-row items-center justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <div className="flex gap-2">
          {/* Boton de crear listas */}
          <CreateListDialogStandalone>
            <Button leftIcon="IconList" />
          </CreateListDialogStandalone>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:gap-2 mx-auto">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 rounded-md border h-[52px] animate-pulse bg-muted"
            >
              <div className="h-5 w-5 bg-muted rounded-full" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                onItemClick(selectedId === item.id ? null : item.id)
              }
              className={`group flex items-center justify-between gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-border ${
                selectedId === item.id
                  ? "bg-primary text-secondary font-medium"
                  : "bg-card dark:bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
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
                <Badge
                  variant={selectedId === item.id ? "secondary" : "default"}
                  className="justify-center rounded-full"
                >
                  {item.count}
                </Badge>

                {isOwner(item.id) && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ItemActionsMenu
                      onEdit={() => setEditingListId(item.id)}
                      onShare={() => setSharingListId(item.id)}
                      onDelete={() => setDeletingListId(item.id)}
                      align="end"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
