import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateLeadDto, CreateProposalDto, UpdateProposalStatusDto } from './dto/create-lead.dto';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async createLead(
    @Req() req: any,
    @Body() body: CreateLeadDto,
  ) {
    return this.leadsService.createLead(
      req.user.userId,
      body,
    );
  }

  @Get('my')
  async getMyLeads(@Req() req: any) {
    return this.leadsService.getMyLeads(req.user.userId);
  }

  @Get('tenant')
  async getTenantLeads(@Req() req: any) {
    return this.leadsService.getLeadsForTenant(req.user.tenantId);
  }

  @Post(':leadId/proposals')
  async createProposal(
    @Param('leadId') leadId: string,
    @Req() req: any,
    @Body() body: CreateProposalDto,
  ) {
    return this.leadsService.createProposal(
      leadId,
      req.user.userId,
      body.valueOffered,
      body.conditions ?? '',
    );
  }

  @Patch('proposals/:id')
  async updateProposalStatus(
    @Param('id') proposalId: string,
    @Req() req: any,
    @Body() body: UpdateProposalStatusDto,
  ) {
    return this.leadsService.updateProposalStatus(
      proposalId,
      req.user.tenantId,
      body.status,
    );
  }
}
