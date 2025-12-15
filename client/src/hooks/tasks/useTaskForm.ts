import { useState, useCallback, useEffect } from "react";
import { useTasks } from "./useTasks";
import { useLists } from "@/hooks/useLists";
import type { Task, TaskPriority, TaskStatus } from "@/types/tasks-system/task";
import type { List } from "@/types/tasks-system/list";

interface TaskFormData {
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  listId: string;
  dueDate: string;
  favorite: boolean;
}

const initialFormData: TaskFormData = {
  name: "",
  description: "",
  priority: "MEDIUM",
  status: "PENDING",
  listId: "",
  dueDate: "",
  favorite: false,
};

const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export function useTaskForm(
  editTask?: Task,
  options: { filterByEditPermission?: boolean } = {},
) {
  const [formData, setFormData] = useState<TaskFormData>(
    editTask
      ? {
          name: editTask.name,
          description: editTask.description || "",
          priority: editTask.priority,
          status: editTask.status,
          listId: editTask.listId,
          dueDate: formatDateForInput(editTask.dueDate),
          favorite: editTask.favorite,
        }
      : initialFormData,
  );
  const [listDialogOpen, setListDialogOpen] = useState(false);

  const { createTask, editTask: updateTask } = useTasks();
  const { accessibleLists, createList, isOwner, canAccess } = useLists();

  const listsToUse = options.filterByEditPermission
    ? accessibleLists.filter(
        (list) => isOwner(list.id) || canAccess(list.id, "EDIT"),
      )
    : accessibleLists;

  useEffect(() => {
    if (editTask) {
      setFormData({
        name: editTask.name,
        description: editTask.description || "",
        priority: editTask.priority,
        status: editTask.status,
        listId: editTask.listId,
        dueDate: formatDateForInput(editTask.dueDate),
        favorite: editTask.favorite,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editTask]);

  useEffect(() => {
    if (listsToUse.length > 0 && !formData.listId && !editTask) {
      setFormData((prev) => ({ ...prev, listId: listsToUse[0].id }));
    }
  }, [listsToUse, formData.listId, editTask]);

  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const handleListCreated = useCallback(
    (listData: Omit<List, "id" | "createdAt" | "shares" | "tasks">) => {
      createList(listData);
    },
    [createList],
  );

  const handleSubmit = useCallback(
    (onSuccess?: () => void) => {
      if (!formData.name.trim() || !formData.listId) {
        return false;
      }

      const taskData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? formData.dueDate : undefined,
        listId: formData.listId,
        favorite: formData.favorite,
      };

      if (editTask) {
        updateTask({ id: editTask.id, ...taskData });
      } else {
        createTask(taskData);
      }

      if (!editTask) {
        resetForm();
      }
      onSuccess?.();
      return true;
    },
    [formData, createTask, updateTask, resetForm, editTask],
  );

  return {
    formData,
    updateField,
    resetForm,
    accessibleLists: listsToUse,
    listDialogOpen,
    setListDialogOpen,
    handleListCreated,
    handleSubmit,
  };
}
