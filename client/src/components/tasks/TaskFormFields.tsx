import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TaskPriorityFilter,
  TaskStatusFilter,
} from "@/components/tasks/TaskFilters";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/shared/Field";
import { useTranslation } from "react-i18next";
import type { TaskPriority, TaskStatus } from "@/types/tasks-system/task";
import type { List } from "@/types/tasks-system/list";

interface TaskFormFieldsProps {
  formData: {
    name: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    listId: string;
    dueDate: string;
  };
  updateField: (field: string, value: string) => void;
  accessibleLists: List[];
  onCreateList?: () => void;
  showCreateList?: boolean;
}

export function TaskFormFields({
  formData,
  updateField,
  accessibleLists,
  onCreateList,
  showCreateList = true,
}: TaskFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <FormField
          label={t("tasks.fields.name.label")}
          htmlFor="name"
          required={true}
        >
          <Input
            id="name"
            placeholder={t("tasks.fields.name.placeholder")}
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </FormField>

        <FormField
          label={t("tasks.fields.list.label")}
          htmlFor="list"
          required={true}
        >
          <Combobox
            items={accessibleLists}
            value={formData.listId}
            onValueChange={(listId) => updateField("listId", listId)}
            onCreateNew={showCreateList ? onCreateList : undefined}
            placeholder={t("tasks.fields.list.placeholder")}
            searchPlaceholder={t("tasks.fields.list.searchPlaceholder")}
            emptyMessage={t("tasks.fields.list.emptyMessage")}
            createNewLabel={t("tasks.fields.list.createNew")}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <FormField label={t("tasks.fields.dueDate.label")} htmlFor="dueDate">
          <Input
            id="dueDate"
            type="date"
            min={new Date(Date.now()).toISOString().split("T")[0]}
            value={formData.dueDate}
            onChange={(e) => updateField("dueDate", e.target.value)}
          />
        </FormField>

        <FormField
          label={t("tasks.fields.priority.label")}
          htmlFor="priority"
          required={false}
        >
          <TaskPriorityFilter
            value={formData.priority}
            onChange={(value) => updateField("priority", value)}
            showAll={false}
            className="w-full"
          />
        </FormField>

        <FormField
          label={t("tasks.fields.status.label")}
          htmlFor="status"
          required={false}
        >
          <TaskStatusFilter
            value={formData.status}
            onChange={(value) => updateField("status", value)}
            showAll={false}
            className="w-full"
          />
        </FormField>
      </div>

      <FormField
        label={t("tasks.fields.description.label")}
        htmlFor="description"
      >
        <Textarea
          id="description"
          placeholder={t("tasks.fields.description.placeholder")}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          className="resize-none"
        />
      </FormField>
    </>
  );
}
