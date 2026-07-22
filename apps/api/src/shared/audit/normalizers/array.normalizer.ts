import { Injectable } from '@nestjs/common';

import { IAuditNormalizer } from '../interfaces';

/**
 * Normalizes arrays so that order never affects the diff: each item is
 * reduced to a comparable primitive (its `uuid`/`id` when it's an object,
 * or the raw value otherwise) and the resulting list is sorted.
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

      if ('uuid' in record) {
        return record.uuid;
      }

      if ('id' in record) {
        return record.id;
      }

      return JSON.stringify(record);
    }

    return item;
  }
}
