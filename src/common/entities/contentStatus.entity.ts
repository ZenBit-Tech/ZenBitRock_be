import {
  Column,
  Entity,
  ManyToOne,
  Unique,
} from 'typeorm';

import { Content } from './content.entity';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';

@Entity()
@Unique(['content', 'user'])
export class ContentStatus extends CoreEntity {
  @Column({ type: 'boolean', name: 'checked', default: false })
  checked: boolean;

  @ManyToOne(() => User, (user) => user.contentStatuses, { eager: true })
  user: User;

  @ManyToOne(() => Content, (content) => content.contentStatuses)
  content: Content;
}
