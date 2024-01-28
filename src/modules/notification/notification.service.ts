import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Notification } from 'src/common/entities/notification.entity';
import { NotificationPayload } from 'src/common/types';
import { NotificationToUser } from 'src/common/entities/notificationToUser';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Notification)
    private notificationToUserRepository: Repository<NotificationToUser>,
  ) {}

  async create(payload: NotificationPayload): Promise<Notification> {
    const { text, type, recipients } = payload;

    const notification = this.notificationRepository.create({
      text,
      type,
    });

    notification.recipients = recipients.map((recipientId) => ({
      user: { id: recipientId },
    })) as NotificationToUser[];

    return await this.notificationRepository.save(notification);
  }

  async delete(id: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    await this.notificationRepository.delete({ id });
  }

  async findNotificationsByUserId(id: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { recipients: { user: { id } } },
    });
  }

  async markAsRead(id: string): Promise<void> {
    const notification = await this.notificationToUserRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }

    await this.notificationToUserRepository.update(id, { isRead: true });
  }

  async findOne(id: string): Promise<Notification> {
    return await this.notificationRepository.findOne({
      where: {
        id,
      },
    });
  }
}
