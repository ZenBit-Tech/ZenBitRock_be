import { Column, Entity, OneToOne } from 'typeorm';

import { CoreEntity } from './core.entity';
// eslint-disable-next-line import/no-cycle
import { VerificationEntity } from './verification.entity';

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
}
