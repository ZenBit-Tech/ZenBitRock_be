import { Column, Entity } from 'typeorm';

import { CoreEntity } from './core.entity';

@Entity()
export class User extends CoreEntity {
  @Column({ type: 'varchar', name: 'email', default: '' })
  email: string;

  @Column({ type: 'varchar', name: 'password', default: '' })
  password: string;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', name: 'veritication_code', default: '' })
  verificationCode: string;

  @Column({ type: 'varchar', name: 'firstName', default: null })
  firstName: string;

  @Column({ type: 'varchar', name: 'lastName', default: null })
  lastName: string;

  @Column({ type: 'varchar', name: 'role', default: null })
  role: string;

  @Column({ type: 'varchar', name: 'gender', default: null })
  gender: string;

  @Column({ type: 'varchar', name: 'dateOfBirth', default: null })
  dateOfBirth: string;

  @Column({ type: 'varchar', name: 'nationality', default: null })
  nationality: string;

  @Column({ type: 'varchar', name: 'identity', default: null })
  identity: string;

  @Column({ type: 'varchar', name: 'status', default: null })
  status: string;

  @Column({ type: 'varchar', name: 'street', default: null })
  street: string;

  @Column({ type: 'varchar', name: 'city', default: null })
  city: string;

  @Column({ type: 'varchar', name: 'state', default: null })
  state: string;

  @Column({ type: 'varchar', name: 'zip', default: null })
  zip: string;

  @Column({ type: 'varchar', name: 'country', default: null })
  country: string;

  @Column({ type: 'varchar', name: 'phone', default: null })
  phone: string;

  @Column({ type: 'varchar', name: 'fileName', default: null })
  fileName: string;

  @Column({ type: 'varchar', name: 'fileUrl', default: null })
  fileUrl: string;

  @Column({ type: 'varchar', name: 'cobrixContactId', default: null })
  cobrixContactId: string;

  @Column({ type: 'varchar', name: 'agencyName', default: null })
  agencyName: string;

  @Column({ type: 'varchar', name: 'description', default: null })
  description: string;
}
