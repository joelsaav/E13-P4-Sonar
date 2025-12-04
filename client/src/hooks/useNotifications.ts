import { useAuth } from "@/hooks/useAuth";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api";
import type { Notification, NotificationType } from "@/types/notification";
import { useCallback, useEffect, useState } from "react";

// Intervalo de polling en milisegundos (30 segundos)
const POLLING_INTERVAL = 30000;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar notificaciones desde la API
   */
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      setError("No se pudieron cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar notificaciones al montar el componente y configurar polling
   */
  useEffect(() => {
    loadNotifications();

    // Solo activar polling si el usuario tiene pushNotifications habilitado
    if (user?.pushNotifications) {
      const intervalId = setInterval(() => {
        loadNotifications();
      }, POLLING_INTERVAL);

      // Limpiar el intervalo al desmontar
      return () => clearInterval(intervalId);
    }

    return undefined;
  }, [loadNotifications, user?.pushNotifications]);

  /**
   * Marcar una notificación como leída
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // Actualizar el estado local
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
      throw err;
    }
  }, []);

  /**
   * Marcar todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      // Actualizar el estado local
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error al marcar todas las notificaciones:", err);
      throw err;
    }
  }, []);

  /**
   * Filtrar notificaciones por tipo
   */
  const getNotificationsByType = useCallback(
    (type: NotificationType) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications],
  );

  /**
   * Contador de notificaciones no leídas
   */
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationsByType,
  };
}
