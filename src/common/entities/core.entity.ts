import { PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class CoreEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  public updatedAt: Date;
}
