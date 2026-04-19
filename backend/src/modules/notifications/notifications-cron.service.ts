import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { NotificationEvents } from './notifications.events';

@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Verifica leads estagnados (status NEW ou UNDER_REVIEW há mais de 48h).
   * Executa a cada 4 horas.
   */
  @Cron(CronExpression.EVERY_4_HOURS)
  async checkStalledLeads() {
    this.logger.log('Iniciando checagem de leads estagnados...');

    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 48);

    const stalledLeads = await this.prisma.lead.findMany({
      where: {
        status: { in: ['NEW', 'UNDER_REVIEW'] },
        createdAt: { lt: threshold },
      },
      include: {
        listing: { select: { ownerId: true, title: true } },
        investor: { select: { fullName: true } },
      },
    });

    for (const lead of stalledLeads) {
      if (lead.listing.ownerId) {
        // Verifica se já notificamos sobre este lead recentemente para evitar spam
        const alreadyNotified = await this.prisma.notification.findFirst({
          where: {
            userId: lead.listing.ownerId,
            type: NotificationEvents.LEAD_STALLED,
            metadata: { path: ['leadId'], equals: lead.id } as any,
            createdAt: { gte: threshold },
          },
        });

        if (!alreadyNotified) {
          await this.notifications.create(
            lead.listing.ownerId,
            NotificationEvents.LEAD_STALLED,
            '',
            '',
            { 
              listingTitle: lead.listing.title, 
              investorName: lead.investor.fullName,
              leadId: lead.id 
            }
          );
        }
      }
    }

    this.logger.log(`Checagem finalizada. ${stalledLeads.length} leads identificados.`);
  }

  /**
   * Futuro: Adicionar lógica de performance de anúncios aqui.
   */
}
