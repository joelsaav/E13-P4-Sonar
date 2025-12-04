import { useState, useCallback, useEffect } from "react";
import { useTasks } from "./useTasks";
import { useLists } from "./useLists";
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

export function useTaskForm(editTask?: Task) {
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
  const { accessibleLists, createList } = useLists();

  // Actualizar el formulario cuando editTask cambia
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

  // Establecer la primera lista por defecto si existe y no hay ninguna seleccionada
  useEffect(() => {
    if (accessibleLists.length > 0 && !formData.listId && !editTask) {
      setFormData((prev) => ({ ...prev, listId: accessibleLists[0].id }));
    }
  }, [accessibleLists, formData.listId, editTask]);

  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const handleListCreated = useCallback(
    (listData: Omit<List, "id" | "createdAt" | "shares" | "tasks">) => {
      // La creación de la lista ahora se maneja en el diálogo de lista
      // Aquí solo necesitamos actualizar el campo listId si la creación fue exitosa
      // Sin embargo, como createList es asíncrono, idealmente deberíamos esperar la respuesta
      // Por ahora, asumiremos que el usuario seleccionará la nueva lista o que el diálogo de lista
      // manejará la selección si es necesario.
      // Dado que CreateListDialog ahora usa el thunk directamente, este callback podría simplificarse
      // o eliminarse si el diálogo maneja todo.
      // Pero para mantener la compatibilidad con el prop onCreateList de CreateListDialog (si se usa en modo controlado),
      // podemos dejarlo.
      // NOTA: CreateListDialog en modo controlado llama a onCreateList con los datos, pero no crea la lista en el store.
      // Si CreateTaskDialog usa CreateListDialog en modo controlado, entonces SÍ necesitamos crear la lista aquí.

      // Revisando CreateTaskDialog, usa CreateListDialog con onCreateList={handleListCreated}.
      // Y CreateListDialog llama a onCreateList en modo controlado.
      // PERO CreateTaskDialog pasa `open` y `onOpenChange`, lo que sugiere modo controlado.
      // Sin embargo, CreateListDialogUnified decide el modo basado en props.
      // Si pasamos `onCreateList`, es modo controlado.

      // Vamos a actualizar esto para despachar la acción createList
      createList(listData);
      // Nota: No podemos saber el ID de la nueva lista inmediatamente aquí sin esperar el thunk.
      // Esto es una limitación actual. Idealmente createList debería devolver la lista creada.
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
        // Modo edición: actualizar tarea existente
        updateTask({ id: editTask.id, ...taskData });
      } else {
        // Modo creación: crear nueva tarea
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
    accessibleLists,
    listDialogOpen,
    setListDialogOpen,
    handleListCreated,
    handleSubmit,
  };
}
