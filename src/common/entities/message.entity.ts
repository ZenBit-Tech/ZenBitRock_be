import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Chat } from './chat.entity';
import { ChatMessageReader } from './chatMessagereader.entity';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';

@Entity()
export class Message extends CoreEntity {
  @Column()
  content: string;

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean;

  @OneToMany(() => ChatMessageReader, (reader) => reader.message)
  readers: ChatMessageReader[];

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages)
  owner: User;
}
