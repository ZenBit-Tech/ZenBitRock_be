import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CoreEntity } from './core.entity';

@Entity()
export class User extends CoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'boolean',
    name: 'is_verified',
    default: false,
  })
  isVerified: boolean;

  @Column({
    type: 'varchar',
    name: 'veritication_code',
    default: '',
  })
  verificationCode: string;
}
