import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  async getMetrics(@Request() req: any) {
    return this.dashboardService.getMetrics(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent-leads')
  async getRecentLeads(@Request() req: any) {
    return this.dashboardService.getRecentLeads(req.user.tenantId);
  }
}
