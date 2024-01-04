import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from './user.entity';
import { CoreEntity } from './core.entity';

@Entity()
export class Chat extends CoreEntity {
  @Column()
  title: string;

  @Column({ type: 'boolean', name: 'is_private', default: false })
  isPrivate: boolean;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @ManyToOne(() => User, (user) => user.chats)
  owner: User;

  @ManyToMany(() => User, (user) => user.joinedChats, { eager: true })
  @JoinTable()
  members: User[];
}
