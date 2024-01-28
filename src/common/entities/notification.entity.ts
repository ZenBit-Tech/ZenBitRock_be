import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CoreEntity } from './core.entity';
import { NotificationToUser } from './notificationToUser';

@Entity()
export class Notification extends CoreEntity {
  @Column()
  type: string;

  @Column()
  text: string;

  @OneToMany(
    () => NotificationToUser,
    (notificationToUser) => notificationToUser.notification,
    {
      cascade: ['insert', 'update', 'recover', 'remove'],
      eager: true,
    },
  )
  recipients: NotificationToUser[];
}
