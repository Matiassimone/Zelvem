/**
 * pgbouncer (transaction mode) connection helpers.
 *
 * Prisma must be told it sits behind a transaction-mode pooler so it avoids
 * session-mode features (prepared statements, advisory locks, SET commands),
 * which break under pgbouncer transaction mode.
 */

/** Caps Prisma's own pool so pgbouncer stays in charge of pooling. */
const DEFAULT_CONNECTION_LIMIT = 5

/**
 * Returns the connection string with the query params Prisma requires
 * behind pgbouncer in transaction mode.
 *
 * @param databaseUrl - Plain Postgres connection string
 * @param connectionLimit - Max connections Prisma may open itself
 * @returns The connection string ready for pgbouncer transaction mode
 */
export function withPgbouncerParams(
  databaseUrl: string,
  connectionLimit: number = DEFAULT_CONNECTION_LIMIT,
): string {
  const url = new URL(databaseUrl)
  url.searchParams.set('pgbouncer', 'true')
  url.searchParams.set('connection_limit', String(connectionLimit))
  return url.toString()
}
