import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateLeadDto, CreateProposalDto, UpdateProposalStatusDto } from './dto/create-lead.dto';
import { AdminLeadQueryDto, UpdateLeadStatusDto, UpdateLeadNotesDto } from './dto/admin-lead.dto';

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

  // --- ADMIN ROUTES ---

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER')
  async adminFindAll(@Query() query: AdminLeadQueryDto) {
    return this.leadsService.adminFindAll(query);
  }

  @Patch('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER')
  async adminUpdateStatus(
    @Param('id') id: string,
    @Body() body: UpdateLeadStatusDto,
  ) {
    return this.leadsService.adminUpdateStatus(id, body);
  }

  @Patch('admin/:id/notes')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER')
  async adminUpdateNotes(
    @Param('id') id: string,
    @Body() body: UpdateLeadNotesDto,
  ) {
    return this.leadsService.adminUpdateNotes(id, body);
  }
}
