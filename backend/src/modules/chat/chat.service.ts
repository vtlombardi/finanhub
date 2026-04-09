import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
  ) {}

  /**
   * Lista todas as conversas em que o usuário participa.
   * Administradores podem ver todas as conversas do tenant.
   */
  async getThreads(userId: string, tenantId: string, role: string) {
    if (role === 'ADMIN' || role === 'OWNER') {
      return this.prisma.chatThread.findMany({
        where: { tenantId },
        include: {
          participants: { include: { user: { select: { id: true, fullName: true, email: true } } } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    return this.prisma.chatThread.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true, email: true } } } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Busca o histórico de mensagens de uma thread específica.
   */
  async getMessages(threadId: string, userId: string, role: string) {
    const thread = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
      include: { participants: true },
    });

    if (!thread) throw new NotFoundException('Conversa não encontrada.');

    // Segurança: Usuário comum só vê se for participante. Admin vê tudo do tenant.
    const isParticipant = thread.participants.some(p => p.userId === userId);
    if (role !== 'ADMIN' && role !== 'OWNER' && !isParticipant) {
      throw new ForbiddenException('Você não tem acesso a esta conversa.');
    }

    return this.prisma.chatMessage.findMany({
      where: { threadId },
      include: { sender: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Envia uma mensagem em uma thread existente.
   * Aplica a regra de negócio: Planos Basic/Starter só recebem mensagens.
   */
  async sendMessage(senderId: string, tenantId: string, role: string, threadId: string, body: string) {
    // 1. Verificação de Plano (Somente para usuários comuns)
    if (role !== 'ADMIN' && role !== 'OWNER') {
      const { features } = await this.plansService.getUsage(tenantId);
      if (!features.chat) {
        throw new ForbiddenException(
          'Seu plano atual permite apenas o recebimento de mensagens. Faça o upgrade para interagir.',
        );
      }
    }

    // 2. Verificação de Participação/Existência
    const thread = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
      include: { participants: true },
    });

    if (!thread) throw new NotFoundException('Conversa inexistente.');

    // 3. Criação da Mensagem e Atualização do Thread
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.chatMessage.create({
        data: {
          threadId,
          senderId,
          body,
        },
      });

      await tx.chatThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      });

      return message;
    });
  }

  /**
   * Cria uma nova thread (ex: suporte ou interesse em anúncio).
   */
  async createThread(userId: string, tenantId: string, targetAdminId?: string, listingId?: string) {
    // Busca um Admin padrão se não houver um ID específico (ou o OWNER do tenant)
    const admin = targetAdminId 
      ? { id: targetAdminId } 
      : await this.prisma.user.findFirst({ where: { tenantId, role: 'OWNER' } });

    if (!admin) throw new NotFoundException('Administrador de destino não encontrado.');

    return this.prisma.chatThread.create({
      data: {
        tenantId,
        listingId: listingId || undefined,
        participants: {
          create: [
            { userId: userId },
            { userId: admin.id },
          ],
        },
      },
    });
  }
}
