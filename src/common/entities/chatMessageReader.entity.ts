/* eslint-disable import/no-cycle */
import { Entity, ManyToOne, JoinColumn } from 'typeorm';

import { CoreEntity } from './core.entity';
import { Message } from './message.entity';
import { User } from './user.entity';

@Entity()
export class ChatMessageReader extends CoreEntity {
  @ManyToOne(() => Message, (message) => message.readers)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User, (user) => user.readMessages)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
