import notificationsReducer, {
  notificationAdded,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsError,
  selectUnreadCount,
  type NotificationsState,
} from "@/store/slices/notificationsSlice";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Notification } from "@/types/notification";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
  apiErrorMessage: (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Error desconocido";
  },
}));

import { api } from "@/lib/api";

describe("notificationsSlice", () => {
  let initialState: NotificationsState;

  const mockNotification: Notification = {
    id: "notif-1",
    userId: "user-1",
    type: "SYSTEM",
    title: "Test Notification",
    message: "This is a test",
    read: false,
    createdAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    initialState = {
      notifications: [],
      isLoading: false,
      error: null,
    };
  });

  describe("reducers", () => {
    it("should return the initial state", () => {
      expect(notificationsReducer(undefined, { type: "unknown" })).toEqual(
        initialState,
      );
    });

    it("should handle notificationAdded", () => {
      const state = notificationsReducer(
        initialState,
        notificationAdded(mockNotification),
      );

      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0]).toEqual(mockNotification);
    });

    it("should not add duplicate notifications", () => {
      const stateWithNotif = {
        ...initialState,
        notifications: [mockNotification],
      };

      const state = notificationsReducer(
        stateWithNotif,
        notificationAdded(mockNotification),
      );

      expect(state.notifications).toHaveLength(1);
    });

    it("should add new notification at the beginning", () => {
      const existingNotif: Notification = {
        ...mockNotification,
        id: "notif-2",
        title: "Existing",
      };
      const stateWithNotif = {
        ...initialState,
        notifications: [existingNotif],
      };

      const newNotif: Notification = {
        ...mockNotification,
        id: "notif-3",
        title: "New",
      };

      const state = notificationsReducer(
        stateWithNotif,
        notificationAdded(newNotif),
      );

      expect(state.notifications).toHaveLength(2);
      expect(state.notifications[0].id).toBe("notif-3");
    });
  });

  describe("async thunks", () => {
    it("should handle fetchNotifications.pending", () => {
      const action = { type: fetchNotifications.pending.type };
      const state = notificationsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fetchNotifications.fulfilled", () => {
      const notifications = [mockNotification];
      const action = {
        type: fetchNotifications.fulfilled.type,
        payload: notifications,
      };
      const state = notificationsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.notifications).toEqual(notifications);
      expect(state.error).toBeNull();
    });

    it("should handle fetchNotifications.rejected", () => {
      const action = {
        type: fetchNotifications.rejected.type,
        payload: "Failed to fetch",
      };
      const state = notificationsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to fetch");
    });

    it("should handle markNotificationAsRead.fulfilled", () => {
      const stateWithNotif = {
        ...initialState,
        notifications: [mockNotification],
      };
      const updatedNotif = { ...mockNotification, read: true };
      const action = {
        type: markNotificationAsRead.fulfilled.type,
        payload: updatedNotif,
      };
      const state = notificationsReducer(stateWithNotif, action);

      expect(state.notifications[0].read).toBe(true);
    });

    it("should handle markNotificationAsRead.rejected", () => {
      const action = {
        type: markNotificationAsRead.rejected.type,
        payload: "Failed to mark as read",
      };
      const state = notificationsReducer(initialState, action);

      expect(state.error).toBe("Failed to mark as read");
    });

    it("should handle markAllNotificationsAsRead.fulfilled", () => {
      const unreadNotifs = [
        { ...mockNotification, id: "1", read: false },
        { ...mockNotification, id: "2", read: false },
      ];
      const stateWithNotifs = {
        ...initialState,
        notifications: unreadNotifs,
      };
      const action = { type: markAllNotificationsAsRead.fulfilled.type };
      const state = notificationsReducer(stateWithNotifs, action);

      expect(state.notifications.every((n) => n.read)).toBe(true);
    });

    it("should handle markAllNotificationsAsRead.rejected", () => {
      const action = {
        type: markAllNotificationsAsRead.rejected.type,
        payload: "Failed to mark all as read",
      };
      const state = notificationsReducer(initialState, action);

      expect(state.error).toBe("Failed to mark all as read");
    });
  });

  describe("selectors", () => {
    const createState = (notificationsState: NotificationsState) => ({
      notifications: notificationsState,
    });

    it("selectNotifications returns notifications array", () => {
      const state = createState({
        notifications: [mockNotification],
        isLoading: false,
        error: null,
      });

      expect(selectNotifications(state)).toEqual([mockNotification]);
    });

    it("selectNotificationsLoading returns loading state", () => {
      const state = createState({
        notifications: [],
        isLoading: true,
        error: null,
      });

      expect(selectNotificationsLoading(state)).toBe(true);
    });

    it("selectNotificationsError returns error", () => {
      const state = createState({
        notifications: [],
        isLoading: false,
        error: "Some error",
      });

      expect(selectNotificationsError(state)).toBe("Some error");
    });

    it("selectUnreadCount returns count of unread notifications", () => {
      const state = createState({
        notifications: [
          { ...mockNotification, id: "1", read: false },
          { ...mockNotification, id: "2", read: true },
          { ...mockNotification, id: "3", read: false },
        ],
        isLoading: false,
        error: null,
      });

      expect(selectUnreadCount(state)).toBe(2);
    });

    it("selectUnreadCount returns 0 when all read", () => {
      const state = createState({
        notifications: [
          { ...mockNotification, id: "1", read: true },
          { ...mockNotification, id: "2", read: true },
        ],
        isLoading: false,
        error: null,
      });

      expect(selectUnreadCount(state)).toBe(0);
    });
  });

  describe("async thunk integration", () => {
    it("fetchNotifications dispatches correctly", async () => {
      const mockData = [mockNotification];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const store = configureStore({
        reducer: { notifications: notificationsReducer },
      });

      await store.dispatch(fetchNotifications());

      expect(store.getState().notifications.notifications).toEqual(mockData);
    });

    it("markNotificationAsRead dispatches correctly", async () => {
      const updatedNotif = { ...mockNotification, read: true };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedNotif });

      const store = configureStore({
        reducer: { notifications: notificationsReducer },
        preloadedState: {
          notifications: {
            notifications: [mockNotification],
            isLoading: false,
            error: null,
          },
        },
      });

      await store.dispatch(markNotificationAsRead("notif-1"));

      expect(store.getState().notifications.notifications[0].read).toBe(true);
    });
  });
});
