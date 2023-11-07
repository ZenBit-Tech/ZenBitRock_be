import { Entity, Column } from 'typeorm';

import { CoreEntity } from './core.entity';

@Entity({ name: 'auth' })
export class Auth extends CoreEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  password: string;
}
