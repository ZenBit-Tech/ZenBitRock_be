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
export class Room extends CoreEntity {
  @Column()
  title: string;

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];

  @ManyToOne(() => User, (user) => user.rooms)
  owner: User;

  @ManyToMany(() => User, (user) => user.joinedRooms, { eager: true })
  @JoinTable()
  members: User[];
}
