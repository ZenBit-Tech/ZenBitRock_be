import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Content } from './content.entity';
import { User } from './user.entity';

@Entity()
export class ContentStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', name: 'checked' })
  checked: boolean;

  @ManyToOne(() => User, (user) => user.contentStatus)
  user: User;

  @ManyToOne(() => Content, (content) => content.contentStatus)
  content: Content;
}
