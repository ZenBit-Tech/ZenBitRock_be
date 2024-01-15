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

  @OneToMany(() => Message, (message) => message.chat, { onDelete: 'CASCADE' })
  messages: Message[];

  @ManyToOne(() => User, (user) => user.chats, {
    eager: true,
    onDelete: 'CASCADE',
  })
  owner: User;

  @ManyToMany(() => User, (user) => user.joinedChats, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  members: User[];
}
