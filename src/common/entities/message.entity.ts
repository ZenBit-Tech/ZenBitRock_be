/* eslint-disable import/no-cycle */
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Chat } from './chat.entity';
import { ChatMessageReader } from './chatMessageReader.entity';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';

@Entity()
export class Message extends CoreEntity {
  @Column()
  content: string;

  @OneToMany(() => ChatMessageReader, (reader) => reader.message)
  readers: ChatMessageReader[];

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  owner: User;
}
