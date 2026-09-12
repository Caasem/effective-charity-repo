const GUARDED_COMPANY_IDENTIFIERS = new Set(['CE012794', '06537070']);

/** Name similarity must not merge these unresolved pilot candidates. */
export function isGuardedIdentity(sourceSystem: string, sourceId: string): boolean {
  return sourceSystem === 'companies_house' && GUARDED_COMPANY_IDENTIFIERS.has(sourceId);
}
