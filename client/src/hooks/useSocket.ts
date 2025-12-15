import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { socket } from "../utils/socket";
import {
  taskAdded,
  taskUpdated,
  taskDeleted,
} from "../store/slices/tasksSlice";
import {
  listUpdated,
  listCreated,
  listDeleted,
} from "../store/slices/listsSlice";
import { notificationAdded } from "../store/slices/notificationsSlice";
import type { Task } from "@/types/tasks-system/task";
import type { List } from "@/types/tasks-system/list";
import type { Notification } from "@/types/notification";

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const lists = useAppSelector((state) => state.lists.lists);
  const joinedListIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit("join_user", user.id);

      socket.on("task:created", (task: Task) => {
        dispatch(taskAdded(task));
      });

      socket.on("task:updated", (task: Task) => {
        dispatch(taskUpdated(task));
      });

      socket.on("task:deleted", (taskId: string) => {
        dispatch(taskDeleted(taskId));
      });

      socket.on("list:updated", (list: List) => {
        dispatch(listUpdated(list));
      });

      socket.on("list:created", (list: List) => {
        dispatch(listCreated(list));
      });

      socket.on("list:deleted", (listId: string) => {
        dispatch(listDeleted(listId));
      });

      socket.on("list:shared", (list: List) => {
        dispatch(listCreated(list));
      });

      socket.on("list:unshared", (listId: string) => {
        dispatch(listDeleted(listId));
      });

      socket.on("notification:created", (notification: Notification) => {
        dispatch(notificationAdded(notification));
      });
    }

    return () => {
      socket.disconnect();
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
      socket.off("list:updated");
      socket.off("list:created");
      socket.off("list:deleted");
      socket.off("list:shared");
      socket.off("list:unshared");
      socket.off("notification:created");
      joinedListIds.current.clear();
    };
  }, [user, dispatch]);

  useEffect(() => {
    const currentIds = new Set(lists.map((list) => list.id));

    for (const id of currentIds) {
      if (!joinedListIds.current.has(id)) {
        socket.emit("join_list", id);
        joinedListIds.current.add(id);
      }
    }

    for (const id of joinedListIds.current) {
      if (!currentIds.has(id)) {
        socket.emit("leave_list", id);
        joinedListIds.current.delete(id);
      }
    }
  }, [lists]);
};
