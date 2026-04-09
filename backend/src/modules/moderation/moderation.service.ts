import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ModerationService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Retorna fila de anúncios pendentes de revisão ou flagged.
   */
  async getQueue(statuses: string[] = ['PENDING_AI_REVIEW', 'FLAGGED'], page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { status: { in: statuses as any } },
        include: {
          tenant: { select: { name: true } },
          category: { select: { name: true } },
          aiInsights: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where: { status: { in: statuses as any } } }),
    ]);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Ação de moderação: aprovar, rejeitar, flaggar ou override da IA.
   * Grava histórico e notifica o dono do listing.
   */
  async applyAction(
    listingId: string,
    moderatorId: string,
    action: 'APPROVE' | 'REJECT' | 'FLAG' | 'OVERRIDE_AI',
    reason?: string,
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, tenantId: true, title: true },
    });

    if (!listing) throw new NotFoundException('Listing não encontrado.');

    const previousStatus = listing.status;
    let newStatus: string;

    switch (action) {
      case 'APPROVE':
        newStatus = 'ACTIVE';
        break;
      case 'REJECT':
        newStatus = 'SUSPENDED';
        break;
      case 'FLAG':
        newStatus = 'FLAGGED';
        break;
      case 'OVERRIDE_AI':
        newStatus = 'ACTIVE'; // Override = aprovar manualmente apesar da IA
        break;
      default:
        newStatus = previousStatus;
    }

    // 1. Atualizar status do listing
    await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: newStatus as any },
    });

    // 2. Gravar histórico de moderação
    const moderationAction = await this.prisma.moderationAction.create({
      data: {
        listingId,
        moderatorId,
        action,
        reason,
        previousStatus,
        newStatus,
      },
    });

    // 3. Notificar o owner do tenant
    const tenantUsers = await this.prisma.user.findMany({
      where: { tenantId: listing.tenantId, role: { in: ['OWNER', 'ADMIN'] } },
      select: { id: true },
    });

    const actionLabels: Record<string, string> = {
      APPROVE: 'aprovado',
      REJECT: 'rejeitado',
      FLAG: 'sinalizado para revisão',
      OVERRIDE_AI: 'aprovado (override manual)',
    };

    await this.notifications.createMany(
      tenantUsers.map((u) => u.id),
      'LISTING_STATUS_CHANGE',
      `Anúncio ${actionLabels[action]}`,
      `"${listing.title}" foi ${actionLabels[action]}${reason ? `. Motivo: ${reason}` : ''}.`,
      { listingId, action, previousStatus, newStatus },
    );

    return moderationAction;
  }

  /**
   * Histórico de ações de moderação para um listing.
   */
  async getHistory(listingId: string) {
    return this.prisma.moderationAction.findMany({
      where: { listingId },
      include: {
        moderator: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
