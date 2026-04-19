import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsHandlerService } from './notifications-handler.service';
import { NotificationsCronService } from './notifications-cron.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService, 
    NotificationsHandlerService, 
    NotificationsCronService
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
