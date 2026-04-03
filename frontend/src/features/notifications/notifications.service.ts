import { api } from '@/services/api.client';

export class NotificationsService {
  static async getNotifications(page = 1) {
    const res = await api.get('/notifications', { params: { page } });
    return res.data;
  }

  static async getUnreadCount() {
    const res = await api.get('/notifications/unread');
    return res.data;
  }

  static async markAsRead(id: string) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  }

  static async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  }
}
