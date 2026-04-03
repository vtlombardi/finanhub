import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma notificação in-app para um usuário.
   */
  async create(userId: string, type: string, title: string, body: string, metadata?: any) {
    return this.prisma.notification.create({
      data: { userId, type, title, body, metadata },
    });
  }

  /**
   * Cria notificações em batch para múltiplos usuários.
   */
  async createMany(userIds: string[], type: string, title: string, body: string, metadata?: any) {
    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, type, title, body, metadata })),
    });
  }

  /**
   * Retorna notificações do usuário (paginado).
   */
  async getForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { data, unreadCount, pagination: { page, limit, total } };
  }

  /**
   * Marca uma notificação como lida.
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Marca todas as notificações do usuário como lidas.
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Contador de não-lidas (para badge na UI).
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unread: count };
  }
}
