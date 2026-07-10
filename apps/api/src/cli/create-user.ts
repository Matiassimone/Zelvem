import argon2 from 'argon2'
import pino from 'pino'

import { loginRequestSchema } from '@zelvem/contracts'
import { getDb } from '@zelvem/database'

/**
 * Community first-user creation. No HTTP surface by design — Community is
 * single-user/small-team and gets no public registration endpoint.
 *
 * Usage:
 *   pnpm zelvem:create-user <email> <password>
 *   docker compose exec api node dist/cli/create-user.js <email> <password>
 */
const logger = pino({ transport: { target: 'pino-pretty' } })

async function main(): Promise<number> {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is required (see .env.example)')
    return 1
  }

  const [email, password] = process.argv.slice(2)
  // ponytail: password via argv — switch to a hidden stdin prompt if this CLI
  // ever runs outside a trusted admin shell (argv leaks into shell history).
  const credentials = loginRequestSchema.safeParse({ email, password })
  if (!credentials.success) {
    logger.error('Usage: create-user <email> <password> — valid email, password of 8+ chars')
    return 1
  }

  const db = getDb('community')
  const existing = await db.user.findUnique({ where: { email: credentials.data.email } })
  if (existing) {
    // Idempotent: an existing user is a satisfied goal, not an error.
    logger.info(`User ${credentials.data.email} already exists — nothing to do`)
    return 0
  }

  const passwordHash = await argon2.hash(credentials.data.password)
  const user = await db.user.create({
    data: { email: credentials.data.email, passwordHash },
  })
  logger.info(`User created: ${user.email} (${user.id})`)
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    logger.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
