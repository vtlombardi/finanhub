import { Module } from '@nestjs/common';
import { DataRoomController } from './dataroom.controller';
import { DataRoomService } from './dataroom.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DataRoomController],
  providers: [DataRoomService],
})
export class DataRoomModule {}
