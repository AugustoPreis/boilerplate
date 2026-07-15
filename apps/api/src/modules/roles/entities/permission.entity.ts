import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { RoleEntity } from './role.entity';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid' })
  uuid!: string;

  @Column({ length: 150, unique: true })
  key!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles!: RoleEntity[];
}
