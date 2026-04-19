import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationCategory, NotificationEvents } from './notifications.events';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Notifica o proprietário de um anúncio sobre um novo lead recebido.
   * Aciona notificação in-app e disparo de e-mail.
   */
  async notifyListingOwnerOfNewLead(leadId: string) {
    // Busca detalhes do lead para notificação
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        investor: true,
        listing: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!lead || !lead.listing) return;

    const ownerId = lead.listing.ownerId;
    const ownerEmail = lead.listing.owner?.email;

    const notificationTitle = 'Novo Lead Recebido';
    const notificationBody = `Interesse manifestado em "${lead.listing.title}" por ${lead.investor.fullName}.`;

    // 1. Notificação In-App
    if (ownerId) {
      await this.create(
        ownerId,
        'NEW_LEAD',
        notificationTitle,
        notificationBody,
        { leadId, listingId: lead.listingId }
      );
    }

    // 2. Notificação por E-mail (via MailService para manter desacoplamento)
    if (ownerEmail) {
      await this.mailService.sendNewLeadNotification(ownerEmail, lead);
    }
    
    // 3. Futuro: WhatsApp/SMS canais podem ser adicionados aqui
  }

  /**
   * Cria uma notificação in-app para um usuário com lógica de inteligência HAYIA.
   */
  async create(userId: string, type: string, title: string, body: string, metadata?: any) {
    // Se não for passado um título/corpo customizado, tenta gerar via Inteligência
    let finalTitle = title;
    let finalBody = body;

    if (!title || !body) {
      const smart = this.generateSmartMessage(type, metadata);
      finalTitle = smart.title;
      finalBody = smart.body;
    }

    return this.prisma.notification.create({
      data: { 
        userId, 
        type, 
        title: finalTitle, 
        body: finalBody, 
        metadata: metadata || {} 
      },
    });
  }

  /**
   * Camada de Inteligência HAYIA: Gera mensagens proativas e orientadas a negócio.
   */
  private generateSmartMessage(type: string, metadata: any = {}) {
    const { listingTitle, investorName, score, docName } = metadata;

    switch (type) {
      case NotificationEvents.LEAD_CREATED:
        return {
          title: 'Novo Lead Qualificado',
          body: `Um investidor interessado em "${listingTitle}" manifestou interesse. Revise o perfil agora.`
        };
      case NotificationEvents.LEAD_SCORE_HIGH:
        return {
          title: 'Oportunidade de Alto Potencial',
          body: `Investidor com score ${score} qualificado para "${listingTitle}". Recomendamos prioridade máxima.`
        };
      case NotificationEvents.LEAD_STALLED:
        return {
          title: 'Risco de Perda de Lead',
          body: `O investidor ${investorName} aguarda resposta há > 48h. Responda agora para manter o engajamento.`
        };
      case NotificationEvents.DATAROOM_VIEWED:
        return {
          title: 'Interesse em Documentação',
          body: `Investidor visualizou "${docName}". Momento ideal para follow-up sobre as informações financeiras.`
        };
      case NotificationEvents.PROPOSAL_RECEIVED:
        return {
          title: 'Proposta Recebida',
          body: `Uma nova oferta foi enviada para "${listingTitle}". Analise os termos e condições.`
        };
      case NotificationEvents.DATAROOM_REQUESTED:
        return {
          title: 'Solicitação de Acesso ao Data Room',
          body: `Um investidor solicitou acesso aos documentos confidenciais. Valide a qualificação antes de liberar.`
        };
      default:
        return {
          title: 'Notificação Finanhub',
          body: 'Você tem uma nova atualização em seu dashboard.'
        };
    }
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
