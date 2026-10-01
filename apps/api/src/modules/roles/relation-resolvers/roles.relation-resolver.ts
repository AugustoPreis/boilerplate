import { Injectable } from '@nestjs/common';

import { IAuditRelationResolver } from '@shared/audit/interfaces';

import { RolesRepository } from '../repositories/roles.repository';

/**
 * Resolves `User.userRoles`'s normalized value (a list of numeric role
 * `id`s, produced by `ArrayNormalizer`) into a human-readable display for
 * the audit trail. Mirrors `PermissionsRelationResolver`.
 */
@Injectable()
export class RolesRelationResolver implements IAuditRelationResolver<unknown> {
  constructor(private readonly rolesRepository: RolesRepository) {}

  // Role names are already human-readable; `locale` isn't needed here, but
  // the signature matches `IAuditRelationResolver` for consistency with
  // resolvers (like `PermissionsRelationResolver`) that do need it.
  async resolve(value: unknown, _locale: string): Promise<unknown> {
    const ids = this.toIdList(value);

    // An empty list is a legitimate "no roles" state, not a failed lookup —
    // resolve it to an empty string so the display shows the engine's usual
    // blank/empty treatment instead of a stray "[]".
    if (ids.length === 0) {
      return '';
    }

    const roles = await this.rolesRepository.findByIds(ids);

    if (roles.length === 0) {
      return value;
    }

    return roles.map((role) => role.name).join(', ');
  }

  private toIdList(value: unknown): number[] {
    const items = Array.isArray(value) ? value : [value];

    return items.map((item) => Number(item)).filter((id): id is number => Number.isFinite(id));
  }
}
