/**
 * Shape of AppException's optional `code` field. Populated case-by-case
 * as call sites are audited (see IMPLEMENTATION_PLAN.md §15.1) — this
 * only fixes the type both sides agree on, not an exhaustive catalog
 * of values.
 */
export type ErrorCode = string;
