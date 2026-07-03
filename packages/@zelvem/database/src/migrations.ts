import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import { err, ok, type Result } from 'neverthrow'

import { AppError } from '@zelvem/core'

const execFileAsync = promisify(execFile)

/** Absolute path to this package's Prisma schema, valid from any caller cwd. */
const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma')

/**
 * Applies pending Prisma migrations (`prisma migrate deploy`) against the
 * given database. Runs programmatically at process startup (container start),
 * before the app accepts traffic.
 *
 * The Prisma CLI is resolved from this package's own dependencies and the
 * schema path is passed explicitly, so callers (apps/api, workers) need no
 * prisma install of their own and no specific working directory.
 *
 * @param databaseUrl - Connection string of the database to migrate
 * @returns Ok with the Prisma CLI output, or Err(`MIGRATION_FAILED`)
 */
export async function runMigrations(databaseUrl: string): Promise<Result<string, AppError>> {
  try {
    const prismaCli = require.resolve('prisma/build/index.js')
    const { stdout } = await execFileAsync(
      process.execPath,
      [prismaCli, 'migrate', 'deploy', '--schema', SCHEMA_PATH],
      { env: { ...process.env, DATABASE_URL: databaseUrl } },
    )
    return ok(stdout)
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    return err(new AppError('MIGRATION_FAILED', detail))
  }
}
