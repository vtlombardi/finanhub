/**
 * @shared/contracts/notifications.ts
 * Contratos para Notificações do sistema.
 */

export interface SystemNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  data: SystemNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
