/* eslint-disable import/no-cycle */
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';

import { CoreEntity } from './core.entity';
import { Message } from './message.entity';
import { User } from './user.entity';

@Entity()
export class ChatMessageLike extends CoreEntity {
  @Column({ type: 'varchar', name: 'like', default: 0 })
  like: number;

  @ManyToOne(() => Message, (message) => message.readers)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User, (user) => user.readMessages)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
