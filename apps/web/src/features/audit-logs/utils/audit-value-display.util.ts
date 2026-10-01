import type {
  AuditLogResponseDTOAction,
  AuditValueDTO,
} from '@core/api/generated/boilerplateAPI.schemas';

export type AuditValueDisplayKind = 'value' | 'empty' | 'deleted';

export interface IAuditValueDisplay {
  kind: AuditValueDisplayKind;
  text?: string;
}

/**
 * CREATED rows never had a prior state, so the old value is always treated
 * as empty regardless of what the backend diff happens to contain.
 */
export function getOldValueDisplay(
  action: AuditLogResponseDTOAction,
  old: AuditValueDTO,
): IAuditValueDisplay {
  if (action === 'CREATED' || !old.display) {
    return { kind: 'empty' };
  }

  return { kind: 'value', text: old.display };
}

/**
 * DELETED rows don't have a "changed to empty" new value — the record (and
 * every field on it) is gone, which reads very differently from "empty".
 */
export function getNewValueDisplay(
  action: AuditLogResponseDTOAction,
  newValue: AuditValueDTO,
): IAuditValueDisplay {
  if (action === 'DELETED') {
    return { kind: 'deleted' };
  }

  if (!newValue.display) {
    return { kind: 'empty' };
  }

  return { kind: 'value', text: newValue.display };
}
