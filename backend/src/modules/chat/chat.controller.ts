import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /** Criar ou obter thread existente para um listing */
  @UseGuards(JwtAuthGuard)
  @Post('threads')
  async getOrCreateThread(@Request() req: any, @Body() body: { listingId: string }) {
    return this.chatService.getOrCreateThread(body.listingId, req.user.userId);
  }

  /** Enviar mensagem */
  @UseGuards(JwtAuthGuard)
  @Post('threads/:threadId/messages')
  async sendMessage(
    @Param('threadId') threadId: string,
    @Request() req: any,
    @Body() body: { body: string },
  ) {
    return this.chatService.sendMessage(threadId, req.user.userId, body.body);
  }

  /** Mensagens de um thread */
  @UseGuards(JwtAuthGuard)
  @Get('threads/:threadId/messages')
  async getMessages(@Param('threadId') threadId: string, @Request() req: any) {
    return this.chatService.getMessages(threadId, req.user.userId);
  }

  /** Inbox do usuário */
  @UseGuards(JwtAuthGuard)
  @Get('inbox')
  async getInbox(@Request() req: any) {
    return this.chatService.getInbox(req.user.userId);
  }

  /** Contador global de não-lidas */
  @UseGuards(JwtAuthGuard)
  @Get('unread')
  async getUnreadCount(@Request() req: any) {
    return this.chatService.getUnreadCount(req.user.userId);
  }
}
