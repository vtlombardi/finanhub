import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  /** Fila de anúncios para revisão */
  @UseGuards(JwtAuthGuard)
  @Get('queue')
  async getQueue(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const statuses = status ? status.split(',') : ['PENDING_AI_REVIEW', 'FLAGGED'];
    return this.moderationService.getQueue(
      statuses,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /** Aplicar ação de moderação */
  @UseGuards(JwtAuthGuard)
  @Post(':listingId/action')
  async applyAction(
    @Param('listingId') listingId: string,
    @Request() req: any,
    @Body() body: { action: 'APPROVE' | 'REJECT' | 'FLAG' | 'OVERRIDE_AI'; reason?: string },
  ) {
    return this.moderationService.applyAction(listingId, req.user.userId, body.action, body.reason);
  }

  /** Histórico de moderação de um listing */
  @UseGuards(JwtAuthGuard)
  @Get(':listingId/history')
  async getHistory(@Param('listingId') listingId: string) {
    return this.moderationService.getHistory(listingId);
  }
}
