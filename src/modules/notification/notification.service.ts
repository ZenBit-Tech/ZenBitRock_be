import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { Notification } from 'src/common/entities/notification.entity';
import { NotificationPayload } from 'src/common/types';
import { NotificationToUser } from 'src/common/entities/notificationToUser';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationToUser)
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

  async deleteToUser(
    notificationId: string,
    userId: string,
  ): Promise<DeleteResult> {
    const notificationToUser = await this.notificationToUserRepository.findOne({
      where: { notification: { id: notificationId }, user: { id: userId } },
    });

    if (!notificationToUser) {
      throw new NotFoundException('Notification not found');
    }
    return this.notificationToUserRepository.delete({
      id: notificationToUser.id,
    });
  }

  async findNotificationsByUserId(id: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { recipients: { user: { id } } },
      relations: { recipients: { user: true } },
      select: { recipients: { user: { id: true } } },
      order: { createdAt: 'DESC' },
    });
  }

  async findNewNotificationsCount(id: string): Promise<number> {
    const notifications = await this.notificationRepository.find({
      where: { recipients: { user: { id }, isRead: false } },
    });

    return notifications.length;
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<UpdateResult> {
    const notificationToUser = await this.notificationToUserRepository.findOne({
      where: { notification: { id: notificationId }, user: { id: userId } },
    });
    if (!notificationToUser) {
      throw new Error(`Notification with id ${notificationId} not found`);
    }

    return await this.notificationToUserRepository.update(
      notificationToUser.id,
      {
        isRead: true,
      },
    );
  }

  async findOne(id: string): Promise<Notification> {
    return await this.notificationRepository.findOne({
      where: {
        id,
      },
    });
  }
}
