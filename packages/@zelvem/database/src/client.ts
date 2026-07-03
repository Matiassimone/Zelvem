import { PrismaClient } from '@prisma/client'

let sharedClient: PrismaClient | undefined

/**
 * Resolves the Prisma client for a given user.
 * For Community (single-user), always returns the same instance, so module
 * code stays identical when Hosted swaps in per-user database routing.
 *
 * @param userId - The unique identifier of the user
 * @returns A PrismaClient scoped to the user's logical database
 */
// userId is the documented signature (CLAUDE.md); Hosted routing will consume it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDb(userId: string): PrismaClient {
  // ponytail: single shared client (Community) — Hosted replaces this with a
  // per-user connection map resolving one logical database per user, routed
  // through pgbouncer via withPgbouncerParams() in pool.ts.
  sharedClient ??= new PrismaClient()
  return sharedClient
}
