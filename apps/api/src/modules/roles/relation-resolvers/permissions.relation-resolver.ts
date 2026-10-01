import { Injectable } from '@nestjs/common';

import { IAuditRelationResolver } from '@shared/audit/interfaces';
import { I18nAuditTranslator } from '@shared/audit/translators/i18n-audit.translator';

import { PermissionEntity } from '../entities/permission.entity';
import { PermissionsRepository } from '../repositories/permissions.repository';

const ACTION_ORDER = ['create', 'read', 'update', 'delete'];

/**
 * Resolves `Role.permissions`'s normalized value (a list of numeric
 * permission `id`s, produced by `ArrayNormalizer`) into a human-readable
 * display for the audit trail: one line per resource, with resource/action
 * codes translated (e.g. "Auditoria: Criar, Visualizar" on its own line,
 * instead of the raw "audit:create, audit:read").
 */
@Injectable()
export class PermissionsRelationResolver implements IAuditRelationResolver<unknown> {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly translator: I18nAuditTranslator,
  ) {}

  async resolve(value: unknown, locale: string): Promise<unknown> {
    const ids = this.toIdList(value);

    // An empty list is a legitimate "no permissions" state, not a failed
    // lookup — resolve it to an empty string so the display shows the
    // engine's usual blank/empty treatment instead of a stray "[]".
    if (ids.length === 0) {
      return '';
    }

    const permissions = await this.permissionsRepository.findByIds(ids);

    if (permissions.length === 0) {
      return value;
    }

    return this.formatGroupedByResource(permissions, locale);
  }

  private formatGroupedByResource(permissions: PermissionEntity[], locale: string): string {
    const byResource = new Map<string, PermissionEntity[]>();

    for (const permission of permissions) {
      const group = byResource.get(permission.resource) ?? [];

      group.push(permission);
      byResource.set(permission.resource, group);
    }

    return Array.from(byResource.entries())
      .map(([resource, resourcePermissions]) => {
        const resourceLabel = this.translator.translateEnum(
          'roles',
          'permission',
          'resource',
          resource,
          locale,
        );
        const actionLabels = resourcePermissions
          .sort((a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action))
          .map((permission) =>
            this.translator.translateEnum(
              'roles',
              'permission',
              'action',
              permission.action,
              locale,
            ),
          );

        return `${resourceLabel}: ${actionLabels.join(', ')}`;
      })
      .sort()
      .join('\n');
  }

  private toIdList(value: unknown): number[] {
    const items = Array.isArray(value) ? value : [value];

    return items.map((item) => Number(item)).filter((id): id is number => Number.isFinite(id));
  }
}
