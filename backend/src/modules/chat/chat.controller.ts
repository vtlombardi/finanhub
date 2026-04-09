import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Obtém todas as threads (conversas) do usuário ou tenant (se admin).
   */
  @Get('threads')
  async getThreads(@Request() req) {
    const { userId, tenantId, role } = req.user;
    return this.chatService.getThreads(userId, tenantId, role);
  }

  /**
   * Obtém o histórico de mensagens de uma conversa.
   */
  @Get('threads/:id/messages')
  async getMessages(@Param('id') threadId: string, @Request() req) {
    const { userId, role } = req.user;
    return this.chatService.getMessages(threadId, userId, role);
  }

  /**
   * Envia uma nova mensagem em um thread.
   */
  @Post('threads/:id/messages')
  async sendMessage(
    @Param('id') threadId: string,
    @Body('body') body: string,
    @Request() req,
  ) {
    const { userId, tenantId, role } = req.user;
    if (!body || body.trim() === '') {
      throw new ForbiddenException('A mensagem não pode estar vazia.');
    }
    return this.chatService.sendMessage(userId, tenantId, role, threadId, body);
  }

  /**
   * Cria uma nova conversa (ex: suporte).
   */
  @Post('threads')
  async createThread(@Body() body: { targetAdminId?: string; listingId?: string }, @Request() req) {
    const { userId, tenantId } = req.user;
    return this.chatService.createThread(userId, tenantId, body.targetAdminId, body.listingId);
  }
}
