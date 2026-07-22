import { Column, Entity, OneToMany } from 'typeorm';

import { Audit, AuditEntity } from '@shared/audit/decorators';
import { EnumFormatter } from '@shared/audit/formatters/enum.formatter';
import { BaseEntity } from '@shared/entities/base.entity';

import { EUserStatus } from '../enums/user-status.enum';

import { UserRoleEntity } from './user-role.entity';

@AuditEntity({ name: 'user', module: 'users' })
@Entity('users')
export class UserEntity extends BaseEntity {
  @Audit()
  @Column({ length: 255, unique: true })
  email!: string;

  // Never audited: it's a secret, not just PII.
  @Audit({ ignore: true })
  @Column({ name: 'password_hash', type: 'text', select: false })
  passwordHash!: string;

  @Audit()
  @Column({ length: 255 })
  name!: string;

  @Audit()
  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl!: string | null;

  @Audit({ formatter: EnumFormatter })
  @Column({ type: 'enum', enum: EUserStatus, enumName: 'user_status', default: EUserStatus.ACTIVE })
  status!: EUserStatus;

  // Never audited: role assignment writes directly to the `user_roles` join
  // table via `UsersRepository.setRoles`, which never calls
  // `UserEntity.repo.save()` — this relation is structurally unobservable by
  // the TypeORM subscriber that drives the audit trail.
  @Audit({ ignore: true })
  @OneToMany(() => UserRoleEntity, (ur) => ur.user, { eager: true })
  userRoles!: UserRoleEntity[];
}
