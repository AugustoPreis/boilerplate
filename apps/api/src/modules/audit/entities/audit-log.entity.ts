import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs', { schema: 'audit' })
export class AuditLogEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid' })
  uuid!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ length: 100 })
  action!: string;

  @Column({ name: 'entity_name', length: 100 })
  entityName!: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId!: string | null;

  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData!: Record<string, unknown> | null;

  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
