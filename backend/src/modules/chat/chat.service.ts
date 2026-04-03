import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria ou retorna thread existente entre um investidor e um listing.
   * Garante que ambos os participantes (investidor + owner do tenant) sejam registrados.
   */
  async getOrCreateThread(listingId: string, investorId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { tenantId: true, id: true },
    });

    if (!listing) throw new NotFoundException('Listing não encontrado.');

    // Buscar thread existente onde o investidor é participante
    const existingThread = await this.prisma.chatThread.findFirst({
      where: {
        listingId,
        participants: { some: { userId: investorId } },
      },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (existingThread) return existingThread;

    // Buscar o owner/admin do tenant para adicionar como participante
    const tenantOwner = await this.prisma.user.findFirst({
      where: { tenantId: listing.tenantId, role: { in: ['OWNER', 'ADMIN'] } },
      select: { id: true },
    });

    const ownerUserId = tenantOwner?.id;

    // Criar thread com participantes
    const thread = await this.prisma.chatThread.create({
      data: {
        tenantId: listing.tenantId,
        listingId,
        participants: {
          create: [
            { userId: investorId },
            ...(ownerUserId && ownerUserId !== investorId
              ? [{ userId: ownerUserId }]
              : []),
          ],
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });

    return thread;
  }

  /**
   * Envia mensagem no thread. Verifica que o sender é participante.
   */
  async sendMessage(threadId: string, senderId: string, body: string) {
    // Verificar participação
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { threadId_userId: { threadId, userId: senderId } },
    });

    if (!participant) {
      throw new ForbiddenException('Você não é participante desta conversa.');
    }

    const message = await this.prisma.chatMessage.create({
      data: { threadId, senderId, body },
      include: { sender: { select: { id: true, fullName: true } } },
    });

    // Atualizar timestamp do thread
    await this.prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    // Criar notificação para os outros participantes
    const otherParticipants = await this.prisma.chatParticipant.findMany({
      where: { threadId, userId: { not: senderId } },
    });

    if (otherParticipants.length > 0) {
      await this.prisma.notification.createMany({
        data: otherParticipants.map((p) => ({
          userId: p.userId,
          type: 'NEW_MESSAGE',
          title: 'Nova mensagem',
          body: `${message.sender.fullName}: "${body.substring(0, 80)}${body.length > 80 ? '...' : ''}"`,
          metadata: { threadId, listingId: null },
        })),
      });
    }

    return message;
  }

  /**
   * Retorna mensagens de um thread (com verificação de participação).
   */
  async getMessages(threadId: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { threadId_userId: { threadId, userId } },
    });

    if (!participant) {
      throw new ForbiddenException('Acesso negado.');
    }

    // Marcar mensagens dos outros como lidas
    await this.prisma.chatMessage.updateMany({
      where: { threadId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    return this.prisma.chatMessage.findMany({
      where: { threadId },
      include: { sender: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Inbox: todas as threads onde o usuário participa, com última mensagem e count de não-lidas.
   */
  async getInbox(userId: string) {
    const threads = await this.prisma.chatThread.findMany({
      where: { participants: { some: { userId } } },
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        participants: { include: { user: { select: { id: true, fullName: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { fullName: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Contar não lidas por thread
    const result = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await this.prisma.chatMessage.count({
          where: { threadId: thread.id, senderId: { not: userId }, isRead: false },
        });
        return { ...thread, unreadCount };
      }),
    );

    return result;
  }

  /**
   * Total global de mensagens não lidas.
   */
  async getUnreadCount(userId: string) {
    const participantThreads = await this.prisma.chatParticipant.findMany({
      where: { userId },
      select: { threadId: true },
    });

    const threadIds = participantThreads.map((p) => p.threadId);

    const count = await this.prisma.chatMessage.count({
      where: {
        threadId: { in: threadIds },
        senderId: { not: userId },
        isRead: false,
      },
    });

    return { unread: count };
  }
}
