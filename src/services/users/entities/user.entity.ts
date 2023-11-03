import { Entity, Column } from 'typeorm';
import { CoreEntity } from '../../../application/entities/core.entity';

@Entity({ name: 'users' })
export class User extends CoreEntity {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  firstName: string;
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  lastName: string;
  @Column({
    type: 'integer',
    nullable: false,
  })
  age: number;
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;
}
