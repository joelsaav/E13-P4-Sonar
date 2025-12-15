import type { Task } from "./task";
import type { SharePermission } from "../permissions";

export interface List {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  tasks: Task[];
  ownerId: string;
  shares: ListShare[];
  owner?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface ListsState {
  lists: List[];
  selectedListId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ListShare {
  id: string;
  permission: SharePermission;
  listId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}
