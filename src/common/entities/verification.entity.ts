/* eslint-disable import/no-cycle */
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { User } from 'common/entities/user.entity';

import { CoreEntity } from './core.entity';
import { VerificationFileEntity } from './verification-file.entity';

@Entity('verification')
export class VerificationEntity extends CoreEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  role: string;

  @Column()
  gender: string;

  @Column()
  dateOfBirth: string;

  @Column()
  nationality: string;

  @Column()
  identity: string;

  @Column()
  status: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip: string;

  @Column()
  country: string;

  @Column()
  phone: string;

  @OneToOne(() => User, (user) => user.verificationData, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => VerificationFileEntity,
    (file) => file.verification,
    { cascade: true, eager: true })
  files: VerificationFileEntity[];
}
