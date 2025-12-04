import { useState } from "react";
import { CreateDialog } from "@/components/ui/createDialog";
import { FormDialog } from "@/components/ui/formDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLists } from "@/hooks/useLists";
import { useTranslation } from "react-i18next";
import type { List } from "@/types/tasks-system/list";

// Props para modo controlado (usado como diálogo anidado)
interface ControlledProps {
  mode: "controlled";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateList: (
    list: Omit<List, "id" | "createdAt" | "tasks" | "shares">,
  ) => void;
}

// Props para modo standalone (usado como componente independiente)
interface StandaloneProps {
  mode?: "standalone";
  trigger?: React.ReactNode;
}

type CreateListDialogUnifiedProps = ControlledProps | StandaloneProps;

function CreateListDialogUnified(props: CreateListDialogUnifiedProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { createList } = useLists();

  const isControlled = props.mode === "controlled";

  const resetForm = () => setFormData({ name: "", description: "" });

  // Handler para modo standalone
  const handleStandaloneSubmit = () => {
    if (!formData.name.trim()) return false;

    createList({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });

    resetForm();
    return true;
  };

  // Handler para modo controlado
  const handleControlledSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isControlled) {
      props.onCreateList({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        ownerId: "",
      });
    }

    resetForm();
    if (isControlled) {
      props.onOpenChange(false);
    }
  };

  const formFields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="listName">
          {t("lists.fields.name.label")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="listName"
          placeholder={t("lists.fields.name.placeholder")}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="listDescription">
          {t("lists.fields.description.label")}
        </Label>
        <Textarea
          id="listDescription"
          placeholder={t("lists.fields.description.placeholder")}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={2}
        />
      </div>
    </>
  );

  // Modo controlado: usa FormDialog
  if (isControlled) {
    return (
      <FormDialog
        open={props.open}
        onOpenChange={props.onOpenChange}
        title={t("lists.create.title")}
        description={t("lists.create.description")}
        onSubmit={handleControlledSubmit}
        submitLabel={t("lists.create.submit")}
        cancelLabel={t("lists.create.cancel")}
        className="max-h-[85vh] sm:max-h-[90vh]"
      >
        {formFields}
      </FormDialog>
    );
  }

  // Modo standalone: usa CreateDialog
  return (
    <CreateDialog
      trigger={props.trigger}
      title={t("lists.create.title")}
      description={t("lists.create.description")}
      onSubmit={handleStandaloneSubmit}
      submitLabel={t("lists.create.submit")}
      cancelLabel={t("lists.create.cancel")}
    >
      {formFields}
    </CreateDialog>
  );
}

// Export por defecto: modo standalone
export default CreateListDialogUnified;

// Export nombrado para modo controlado
export function CreateListDialog(props: Omit<ControlledProps, "mode">) {
  return <CreateListDialogUnified mode="controlled" {...props} />;
}

// Export nombrado para modo standalone (alias)
export function CreateListDialogStandalone(props: {
  children?: React.ReactNode;
}) {
  return <CreateListDialogUnified mode="standalone" trigger={props.children} />;
}
