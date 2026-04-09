import { useState, useEffect, useCallback } from 'react';
import { NotificationsService } from '@/services/notifications.service';
import { SystemNotification } from '@shared/contracts';

export function useNotifications(page: number = 1) {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await NotificationsService.getNotifications(p);
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError('Erro ao carregar notificações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const markOne = async (id: string) => {
    try {
      await NotificationsService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(u => Math.max(0, u - 1));
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const markAll = async () => {
    try {
      await NotificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const refresh = useCallback(() => load(page), [load, page]);

  return { notifications, unreadCount, total, loading, error, refresh, markOne, markAll };
}
