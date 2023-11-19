import { Column, Entity, ManyToOne } from 'typeorm';

import { CoreEntity } from './core.entity';
// eslint-disable-next-line import/no-cycle
import { VerificationEntity } from './verification.entity';

@Entity('file')
export class VerificationFileEntity extends CoreEntity {
  @Column()
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  fileUrl: string;

  @ManyToOne(() => VerificationEntity, (verification) => verification.files, { onDelete: 'CASCADE' })
  verification: VerificationEntity;
}
