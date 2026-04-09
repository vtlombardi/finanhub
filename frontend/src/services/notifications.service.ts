import { api } from './api.client';
import { NotificationResponse, SystemNotification } from '@shared/contracts';

export class NotificationsService {
  /** Listar notificações com paginação */
  static async getNotifications(page: number = 1): Promise<NotificationResponse> {
    const response = await api.get<NotificationResponse>('/notifications', { params: { page } });
    return response.data;
  }

  /** Obter apenas contagem de não lidas */
  static async getUnreadCount(): Promise<number> {
    const response = await api.get<{ unread: number }>('/notifications/unread');
    return response.data.unread;
  }

  /** Marcar uma como lida */
  static async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  /** Marcar todas como lidas */
  static async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  }
}
