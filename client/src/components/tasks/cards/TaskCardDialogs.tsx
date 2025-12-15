import { memo } from "react";
import { Button } from "@/components/ui/button";
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
import { useTranslation } from "react-i18next";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  onConfirm: () => void;
}

interface UnshareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  onConfirm: () => void;
}

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string;
}

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteTaskDialog = memo(function DeleteTaskDialog({
  open,
  onOpenChange,
  taskName,
  onConfirm,
}: DeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("tasks.delete.title")}</DialogTitle>
          <DialogDescription>
            {t("tasks.delete.description", { name: taskName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("tasks.delete.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t("tasks.delete.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const UnshareTaskDialog = memo(function UnshareTaskDialog({
  open,
  onOpenChange,
  taskName,
  onConfirm,
}: UnshareDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("common.leave")}</DialogTitle>
          <DialogDescription>
            {t("share.leaveConfirmation", { name: taskName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t("common.leave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const TaskErrorDialog = memo(function TaskErrorDialog({
  open,
  onOpenChange,
  errorMessage,
}: ErrorDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("share.errors.actionNotAllowed")}
          </AlertDialogTitle>
          <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            {t("share.errors.understood")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

export const TaskCompletionDialog = memo(function TaskCompletionDialog({
  open,
  onOpenChange,
}: CompletionDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("tasks.completion.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("tasks.completion.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            {t("tasks.completion.understood")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
