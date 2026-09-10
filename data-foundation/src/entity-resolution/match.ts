/**
 * Entity resolution primitives.
 *
 * The core problem: the same real-world organisation appears as a Charity
 * Commission record, a Companies House record (many UK charities are also
 * registered companies limited by guarantee), and eventually a
 * self-submitted Effective Charity profile. We need one canonical
 * `resolved_entities` row per real organisation, with every source record
 * linked to it and a confidence score explaining why.
 */

/** Lowercase, strip legal suffixes and punctuation, collapse whitespace. */
export function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[.,'"()]/g, '')
    .replace(
      /\b(the|ltd|limited|charity|charitable|trust|foundation|uk|worldwide|international|inc|company|cic|trading as|t\/a)\b/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein distance — small strings only (org names), so O(n*m) is fine. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/** Similarity in [0,1], 1 = identical, based on normalized Levenshtein distance. */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return 1 - dist / maxLen;
}

export interface MatchCandidate {
  sourceA: { system: string; id: string; name: string };
  sourceB: { system: string; id: string; name: string };
  confidence: number;
  method: string;
}

/**
 * Given two lists of {id, name} from different source systems, return the
 * best candidate match for each A record (if any clears the threshold).
 * This is intentionally simple (no blocking/indexing) — fine up to tens of
 * thousands of records; swap for a proper blocking strategy (e.g. by
 * postcode or first token) before that.
 */
export function matchByName(
  systemA: string,
  listA: { id: string; name: string }[],
  systemB: string,
  listB: { id: string; name: string }[],
  threshold = 0.82
): MatchCandidate[] {
  const results: MatchCandidate[] = [];
  for (const a of listA) {
    let best: { b: { id: string; name: string }; score: number } | null = null;
    for (const b of listB) {
      const score = nameSimilarity(a.name, b.name);
      if (!best || score > best.score) best = { b, score };
    }
    if (best && best.score >= threshold) {
      results.push({
        sourceA: { system: systemA, id: a.id, name: a.name },
        sourceB: { system: systemB, id: best.b.id, name: best.b.name },
        confidence: Math.round(best.score * 100) / 100,
        method: best.score === 1 ? 'name_exact' : 'name_fuzzy',
      });
    }
  }
  return results;
}
