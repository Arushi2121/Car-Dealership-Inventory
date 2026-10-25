/**
 * Returns `next` only if it is a path on this site; otherwise the showroom.
 * "//host" and "/\host" are treated by browsers as other sites, so both are refused.
 */
export function safeNext(next: string | null): string {
  const isLocalPath =
    next !== null && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\');
  return isLocalPath ? next : '/showroom';
}
