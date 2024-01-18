import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ContentStatus } from './contentStatus.entity';
import { User } from './user.entity';

@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @Column({ type: 'varchar', name: 'link' })
  link: string;

  @Column({ type: 'varchar', name: 'type' })
  type: string;

  @Column({ type: 'varchar', name: 'screenshot', nullable: true })
  screenshot?: string;

  @ManyToOne(() => User, (user) => user.contents)
  user: User;

  @ManyToOne(() => ContentStatus, (contentStatus) => contentStatus.content)
  contentStatus: ContentStatus;
}
