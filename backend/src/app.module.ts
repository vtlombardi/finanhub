import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HealthController } from './common/health/health.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { ChatModule } from './modules/chat/chat.module';
import { ListingsModule } from './modules/listings/listings.module';
import { LeadsModule } from './modules/leads/leads.module';
import { PlansModule } from './modules/plans/plans.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdsModule } from './modules/ads/ads.module';
import { DataRoomModule } from './modules/dataroom/dataroom.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,   // janela de 1 minuto
        limit: 100,   // 100 requests/min por IP (rotas gerais)
      },
    ]),
    PrismaModule,
    AuthModule,
    MailModule,
    ChatModule,
    ListingsModule,
    LeadsModule,
    PlansModule,
    AnalyticsModule,
    CategoriesModule,
    UsersModule,
    TenantsModule,
    CompaniesModule,
    DashboardModule,
    ModerationModule,
    NotificationsModule,
    AdsModule,
    DataRoomModule,
    OpportunitiesModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
