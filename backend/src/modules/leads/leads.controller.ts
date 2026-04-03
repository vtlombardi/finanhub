import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * POST /leads — Investidor manifesta interesse em um listing.
   * Body: { listingId, message }
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createLead(@Request() req: any, @Body() body: { listingId: string; message: string }) {
    return this.leadsService.createLead(
      body.listingId,
      req.user.userId,
      body.message,
      req.user.tenantId,
    );
  }

  /**
   * GET /leads/me — Investidor vê seus leads.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyLeads(@Request() req: any) {
    return this.leadsService.getMyLeads(req.user.userId);
  }

  /**
   * GET /leads/tenant — Vendedor vê leads recebidos nos seus anúncios.
   */
  @UseGuards(JwtAuthGuard)
  @Get('tenant')
  async getLeadsForTenant(@Request() req: any) {
    return this.leadsService.getLeadsForTenant(req.user.tenantId);
  }

  /**
   * POST /leads/:leadId/proposals — Enviar proposta formal.
   * Body: { valueOffered, conditions? }
   */
  @UseGuards(JwtAuthGuard)
  @Post(':leadId/proposals')
  async createProposal(
    @Param('leadId') leadId: string,
    @Request() req: any,
    @Body() body: { valueOffered: number; conditions?: string },
  ) {
    return this.leadsService.createProposal(leadId, req.user.userId, body.valueOffered, body.conditions);
  }

  /**
   * PATCH /leads/proposals/:proposalId — Vendedor aceita/rejeita proposta.
   * Body: { status: 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFER' }
   */
  @UseGuards(JwtAuthGuard)
  @Patch('proposals/:proposalId')
  async updateProposalStatus(
    @Param('proposalId') proposalId: string,
    @Request() req: any,
    @Body() body: { status: string },
  ) {
    return this.leadsService.updateProposalStatus(proposalId, req.user.tenantId, body.status);
  }
}
