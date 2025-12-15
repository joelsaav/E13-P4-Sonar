import { api, apiErrorMessage } from "@/lib/api";
import type { Notification } from "@/types/notification";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Notification[]>("/notifications");
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<Notification>(
        `/notifications/${notificationId}/read`,
      );
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err));
    }
  },
);

export const markAllNotificationsAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("notifications/markAllAsRead", async (_, { rejectWithValue }) => {
  try {
    await api.patch("/notifications/read-all");
    return;
  } catch (err) {
    return rejectWithValue(apiErrorMessage(err));
  }
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notificationAdded: (state, action: PayloadAction<Notification>) => {
      if (!state.notifications.find((n) => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n.id === action.payload.id,
        );
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { notificationAdded } = notificationsSlice.actions;

export default notificationsSlice.reducer;

export const selectNotifications = (state: {
  notifications: NotificationsState;
}) => state.notifications.notifications;

export const selectNotificationsLoading = (state: {
  notifications: NotificationsState;
}) => state.notifications.isLoading;

export const selectNotificationsError = (state: {
  notifications: NotificationsState;
}) => state.notifications.error;

export const selectUnreadCount = (state: {
  notifications: NotificationsState;
}) => state.notifications.notifications.filter((n) => !n.read).length;
