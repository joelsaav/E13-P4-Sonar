import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  cancelLabel: string;
  children: ReactNode;
  className?: string;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel,
  cancelLabel,
  children,
  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
          {children}

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {cancelLabel}
            </Button>
            <Button type="submit" className="w-full sm:flex-1">
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
