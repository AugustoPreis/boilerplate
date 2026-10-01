export interface IAuditRelationResolver<T = unknown> {
  /**
   * Resolves a raw field value (e.g. a foreign key id/uuid) into a human-readable
   * representation. Implementations must degrade gracefully: if the lookup fails
   * (record deleted, service unavailable, etc.), they should resolve to a sensible
   * fallback instead of throwing, so a broken relation never breaks the audit trail.
   *
   * `locale` is handed through for resolvers that also need to translate
   * enum-like parts of the value they resolve (e.g. permission resource/action
   * codes into display labels).
   */
  resolve(value: T, locale: string): Promise<unknown>;
}
