import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('metrics')
  async getMetrics(@Request() req: any) {
    return this.dashboardService.getMetrics(req.user.tenantId);
  }

  @Get('recent-leads')
  async getRecentLeads(@Request() req: any) {
    return this.dashboardService.getRecentLeads(req.user.tenantId);
  }

  @Get('analytics/summary')
  async getAnalyticsSummary(@Request() req: any) {
    return this.analyticsService.getSummary(req.user.tenantId);
  }
}
