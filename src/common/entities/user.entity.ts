import { Column, Entity, OneToOne } from 'typeorm';

import { CoreEntity } from './core.entity';
// eslint-disable-next-line import/no-cycle
import { VerificationEntity } from './verification.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CoreEntity } from './core.entity';

@Entity()
export class User extends CoreEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @OneToOne(
    () => VerificationEntity,
    (verificationData) => verificationData.user,
    { cascade: true, eager: true },
  )
  verificationData: VerificationEntity;
  
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
