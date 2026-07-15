import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '@shared/entities/base.entity';

import { UserRoleEntity } from './user-role.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'text', select: false })
  passwordHash!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'enum', enum: UserStatus, enumName: 'user_status', default: UserStatus.ACTIVE })
  status!: UserStatus;

  @OneToMany(() => UserRoleEntity, (ur) => ur.user, { eager: true })
  userRoles!: UserRoleEntity[];
}
