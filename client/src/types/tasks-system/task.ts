import type { SharePermission } from "../permissions";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export const TaskStatusColors: Record<TaskStatus, string> = {
  PENDING: "#FFA500",
  IN_PROGRESS: "#007BFF",
  COMPLETED: "#28A745",
};
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export const TaskPriorityColors: Record<TaskPriority, string> = {
  LOW: "#6B7280",
  MEDIUM: "#3B82F6",
  HIGH: "#F59E0B",
  URGENT: "#DC2626",
};

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  listId: string;
  completed: boolean;
  shares: TaskShare[];
  favorite: boolean;
  updatedAt: string;
  list?: {
    id: string;
    name: string;
    owner?: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  };
}

export interface TasksState {
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: "all" | TaskStatus;
    listId: string | null;
    search: string;
    priority: "all" | TaskPriority;
    favorite: "all" | "yes" | "no";
  };
  sorting: {
    field: "name" | "dueDate" | "priority" | "createdAt" | "updatedAt";
    order: "asc" | "desc";
  };
}

export interface TaskShare {
  id: string;
  permission: SharePermission;
  taskId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}
