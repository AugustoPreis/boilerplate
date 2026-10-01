import { Injectable } from '@nestjs/common';

import { IAuditNormalizer } from '../interfaces';

/**
 * Normalizes arrays so that order never affects the diff: each item is
 * reduced to a comparable primitive (its `id`/`uuid` when it's an object, or
 * the raw value otherwise) and the resulting list is sorted.
 *
 * `id` is prioritized over `uuid`: TypeORM only loads the "before" snapshot
 * of a to-many relation via `loadRelationIds` (entities shaped as `{ id }`,
 * no `uuid`), while the "after" snapshot assigned in memory before `save()`
 * carries full entities (with both `id` and `uuid`). Preferring `id`, when
 * present on either side, keeps both snapshots comparable by the same key.
 *
 * `roleId` covers join-row entities with a composite primary key and no
 * own `id`/`uuid` (e.g. `UserRoleEntity`) — without it, two independently
 * loaded snapshots of the same unchanged membership fall back to
 * `JSON.stringify`, which rarely matches byte-for-byte (nested eager
 * relations, key order) and produces false-positive diffs with a raw JSON
 * blob instead of a resolvable id.
 */
@Injectable()
export class ArrayNormalizer implements IAuditNormalizer<unknown> {
  normalize(value: unknown): unknown {
    if (value === undefined || value === null) {
      return null;
    }

    if (!Array.isArray(value)) {
      return value;
    }

    return value
      .map((item) => this.normalizeItem(item))
      .sort((a, b) => String(a).localeCompare(String(b)));
  }

  private normalizeItem(item: unknown): unknown {
    if (item !== null && typeof item === 'object') {
      const record = item as Record<string, unknown>;

      if ('id' in record) {
        return record.id;
      }

      if ('uuid' in record) {
        return record.uuid;
      }

      if ('roleId' in record) {
        return record.roleId;
      }

      return JSON.stringify(record);
    }

    return item;
  }
}
