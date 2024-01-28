/* eslint-disable import/no-cycle */
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';

import { CoreEntity } from './core.entity';
import { User } from './user.entity';
import { Notification } from './notification.entity';

@Entity()
export class NotificationToUser extends CoreEntity {
  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean;

  @ManyToOne(() => Notification, (notification) => notification.recipients)
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
