import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { SharePermission } from "@/types/permissions";
import { selectLists } from "./listsSlice";
import { selectTasks } from "./tasksSlice";
import { selectUser } from "./authSlice";

export function hasPermission(
  userPermission: SharePermission,
  requiredPermission: SharePermission,
): boolean {
  const permissionLevels: Record<SharePermission, number> = {
    VIEW: 1,
    EDIT: 2,
    ADMIN: 3,
  };
  return (
    permissionLevels[userPermission] >= permissionLevels[requiredPermission]
  );
}

export const isListOwner =
  (listId: string) =>
  (state: RootState): boolean => {
    const user = selectUser(state);
    const lists = selectLists(state);
    if (!user) return false;
    const list = lists.find((l) => l.id === listId);
    return list?.ownerId === user.id;
  };

export const getListPermission =
  (listId: string) =>
  (state: RootState): SharePermission | null => {
    const user = selectUser(state);
    const lists = selectLists(state);
    if (!user) return null;
    const list = lists.find((l) => l.id === listId);
    if (!list) return null;
    if (list.ownerId === user.id) return "ADMIN";
    const share = list.shares.find((s) => s.userId === user.id);
    return share?.permission || null;
  };

export const canAccessList =
  (listId: string, requiredPermission: SharePermission = "VIEW") =>
  (state: RootState): boolean => {
    const permission = getListPermission(listId)(state);
    if (!permission) return false;
    return hasPermission(permission, requiredPermission);
  };

export const getTaskPermission =
  (taskId: string) =>
  (state: RootState): SharePermission | null => {
    const user = selectUser(state);
    const tasks = selectTasks(state);
    const lists = selectLists(state);
    if (!user) return null;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;
    const list = lists.find((l) => l.id === task.listId);
    if (!list) return null;
    if (list.ownerId === user.id) return "ADMIN";
    const taskShare = task.shares.find((s) => s.userId === user.id);
    if (taskShare) return taskShare.permission;
    const listShare = list.shares.find((s) => s.userId === user.id);
    if (listShare) return listShare.permission;
    return null;
  };

export const canAccessTask =
  (taskId: string, requiredPermission: SharePermission = "VIEW") =>
  (state: RootState): boolean => {
    const permission = getTaskPermission(taskId)(state);
    if (!permission) return false;
    return hasPermission(permission, requiredPermission);
  };

export const selectAccessibleLists = createSelector(
  [selectLists, selectUser],
  (lists, user) => {
    if (!user) return [];
    return lists.filter(
      (list) =>
        list.ownerId === user.id ||
        list.shares.some((share) => share.userId === user.id),
    );
  },
);

export const selectAccessibleTasks = createSelector(
  [selectTasks, selectLists, selectUser],
  (tasks, lists, user) => {
    if (!user) return [];
    return tasks.filter((task) => {
      const list = lists.find((l) => l.id === task.listId);
      if (!list) return false;
      return (
        list.ownerId === user.id ||
        task.shares.some((share) => share.userId === user.id) ||
        list.shares.some((share) => share.userId === user.id)
      );
    });
  },
);

export const selectAccessibleTasksByList = (listId: string) =>
  createSelector([selectAccessibleTasks], (tasks) =>
    tasks.filter((task) => task.listId === listId),
  );
