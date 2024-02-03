/* eslint-disable import/no-cycle */
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';

import { CoreEntity } from './core.entity';
import { Message } from './message.entity';
import { User } from './user.entity';

@Entity()
export class ChatMessageLike extends CoreEntity {
  @Column({ type: 'varchar', name: 'like', default: 0 })
  like: string;

  @ManyToOne(() => Message, (message) => message.likes)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User, (user) => user.likeMessages)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
