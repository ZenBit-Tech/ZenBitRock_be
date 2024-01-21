import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

import { ContentStatus } from './contentStatus.entity';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';

@Entity()
export class Content extends CoreEntity {
  @Column({ type: 'varchar', name: 'title' }) title: string;

  @Column({ type: 'varchar', name: 'link' }) link: string;

  @Column({ type: 'varchar', name: 'type' }) type: string;

  @Column({ type: 'varchar', name: 'screenshot', nullable: true })
  screenshot?: string;

  @ManyToMany(() => User, (user) => user.contents, { cascade: true })
  users: User[];

  @OneToMany(() => ContentStatus, (contentStatus) => contentStatus.content, {
    cascade: true,
    eager: true,
  })
  contentStatuses: ContentStatus[];
}
