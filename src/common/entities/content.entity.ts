import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

import { ContentStatus } from 'common/entities/contentStatus.entity';
import { CoreEntity } from 'common/entities/core.entity';
import { User } from 'common/entities/user.entity';
import { ContentType } from 'common/types/content/content.type.enum';

@Entity()
export class Content extends CoreEntity {
  @Column({ type: 'varchar', name: 'title' }) title: string;

  @Column({ type: 'varchar', name: 'link' }) link: string;

  @Column({ type: 'enum', enum: ['video', 'article'], name: 'type' })
  type: ContentType;

  @Column({ type: 'varchar', name: 'screenshot', nullable: true })
  screenshot?: string;

  @ManyToMany(() => User, (user) => user.contents, { cascade: true })
  users: User[];

  @OneToMany(() => ContentStatus, (contentStatus) => contentStatus.content, {
    onDelete: 'CASCADE',
    cascade: true,
    eager: true,
  })
  contentStatuses: ContentStatus[];
}
