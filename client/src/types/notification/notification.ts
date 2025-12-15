export type NotificationType = "SYSTEM" | "SHARED" | "EXPIRED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  actorName: string;
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface NotificationResponse {
  notifications: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}
