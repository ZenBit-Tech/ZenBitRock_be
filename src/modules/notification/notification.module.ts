import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/common/entities/notification.entity';
import { NotificationToUser } from 'src/common/entities/notificationToUser';
import { NotificationService } from './notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationToUser])],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
