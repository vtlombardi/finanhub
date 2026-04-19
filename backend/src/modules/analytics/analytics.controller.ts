import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('dashboard/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @Roles('OWNER', 'ADMIN', 'USER')
  async getSummary(
    @Request() req: any,
    @Query('days') days?: string
  ) {
    const range = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getSummary(req.user.tenantId, range);
  }

  @Get('trends')
  @Roles('OWNER', 'ADMIN', 'USER')
  async getTrends(@Request() req: any) {
    return this.analyticsService.getSummary(req.user.tenantId);
  }

  @Get('export/leads/csv')
  @Roles('OWNER', 'ADMIN', 'USER')
  async getLeadsCsv(@Request() req: any) {
    return this.analyticsService.exportLeadsToCsv(req.user.tenantId);
  }
}
