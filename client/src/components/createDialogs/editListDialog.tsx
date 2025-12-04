import { useState, useEffect } from "react";
import { FormDialog } from "@/components/ui/formDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLists } from "@/hooks/useLists";
import { useTranslation } from "react-i18next";
import type { List } from "@/types/tasks-system/list";

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: List;
}

export default function EditListDialog({
  open,
  onOpenChange,
  list,
}: EditListDialogProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: list.name,
    description: list.description || "",
  });
  const { editList } = useLists();

  useEffect(() => {
    if (open) {
      setFormData({
        name: list.name,
        description: list.description || "",
      });
    }
  }, [open, list]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    editList({
      id: list.id,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });

    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("lists.edit.title")}
      description={t("lists.edit.description")}
      onSubmit={handleSubmit}
      submitLabel={t("lists.edit.submit")}
      cancelLabel={t("lists.edit.cancel")}
      className="max-h-[85vh] sm:max-h-[90vh]"
    >
      <div className="space-y-2">
        <Label htmlFor="editListName">
          {t("lists.fields.name.label")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="editListName"
          placeholder={t("lists.fields.name.placeholder")}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="editListDescription">
          {t("lists.fields.description.label")}
        </Label>
        <Textarea
          id="editListDescription"
          placeholder={t("lists.fields.description.placeholder")}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={2}
        />
      </div>
    </FormDialog>
  );
}
