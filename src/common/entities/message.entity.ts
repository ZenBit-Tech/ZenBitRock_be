import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Chat } from './chat.entity';
import { CoreEntity } from './core.entity';

@Entity()
export class Message extends CoreEntity {
  @Column()
  content: string;

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean;

  @Column()
  chatId: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages)
  owner: User;
}
