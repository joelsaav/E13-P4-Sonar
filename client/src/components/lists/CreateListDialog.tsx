import { useState } from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLists } from "@/hooks/useLists";
import { useTranslation } from "react-i18next";
import type { List } from "@/types/tasks-system/list";

interface ControlledProps {
  mode: "controlled";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateList: (
    list: Omit<List, "id" | "createdAt" | "tasks" | "shares">,
  ) => void;
}

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

  const handleStandaloneSubmit = () => {
    if (!formData.name.trim()) return false;

    createList({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });

    resetForm();
    return true;
  };

  const handleControlledSubmit = () => {
    if (!formData.name.trim()) return false;

    if (isControlled) {
      props.onCreateList({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        ownerId: "",
      });
    }

    resetForm();
    return true;
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
      >
        {formFields}
      </FormDialog>
    );
  }

  return (
    <FormDialog
      trigger={props.trigger}
      title={t("lists.create.title")}
      description={t("lists.create.description")}
      onSubmit={handleStandaloneSubmit}
      submitLabel={t("lists.create.submit")}
      cancelLabel={t("lists.create.cancel")}
    >
      {formFields}
    </FormDialog>
  );
}

export default CreateListDialogUnified;

export function CreateListDialog(props: Omit<ControlledProps, "mode">) {
  return <CreateListDialogUnified mode="controlled" {...props} />;
}

export function CreateListDialogStandalone(props: {
  children?: React.ReactNode;
}) {
  return <CreateListDialogUnified mode="standalone" trigger={props.children} />;
}
