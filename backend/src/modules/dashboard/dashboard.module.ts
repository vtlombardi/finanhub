import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [AnalyticsModule, PrismaModule],
  controllers: [DashboardController, AdminDashboardController],
  providers: [DashboardService, AdminDashboardService],
  exports: [DashboardService, AdminDashboardService],
})
export class DashboardModule {}
