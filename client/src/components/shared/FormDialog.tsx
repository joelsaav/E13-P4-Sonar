import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface FormDialogProps {
  trigger?: ReactNode;
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => boolean | void;
  submitLabel: string;
  cancelLabel?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function FormDialog({
  trigger,
  title,
  description,
  onSubmit,
  submitLabel,
  cancelLabel,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  className,
}: FormDialogProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSubmit(e);
    if (result !== false) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "max-h-[85vh] sm:max-h-[90vh] overflow-y-auto sm:max-w-3xl",
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {children}

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              {cancelLabel || t("common.cancel")}
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
