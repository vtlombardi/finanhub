import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { CompaniesModule } from './companies/companies.module';
import { ListingsModule } from './listings/listings.module';
import { CategoriesModule } from './categories/categories.module';
import { LeadsModule } from './leads/leads.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ModerationModule } from './moderation/moderation.module';
import { PlansModule } from './plans/plans.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TenantMiddleware } from '../common/middleware/tenant.middleware';
import { PrismaModule } from '../common/prisma/prisma.module';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    PrismaModule,
    AuthModule, 
    UsersModule, 
    TenantsModule, 
    CompaniesModule, 
    ListingsModule, 
    CategoriesModule,
    LeadsModule,
    DashboardModule,
    ChatModule,
    NotificationsModule,
    ModerationModule,
    PlansModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}

