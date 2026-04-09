import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('dashboard/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @Roles('OWNER', 'ADMIN') // Apenas gestores veem o BI do tenant
  async getSummary(@Request() req: any) {
    return this.analyticsService.getSummary(req.user.tenantId);
  }

  @Get('trends')
  @Roles('OWNER', 'ADMIN')
  async getTrends(@Request() req: any) {
    return this.analyticsService.getSummary(req.user.tenantId);
  }

  @Get('export/leads/csv')
  @Roles('OWNER', 'ADMIN')
  async getLeadsCsv(@Request() req: any) {
    return this.analyticsService.exportLeadsToCsv(req.user.tenantId);
  }
}
