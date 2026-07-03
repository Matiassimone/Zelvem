import { z } from 'zod'

/** Environment contract for the API. The process refuses to start if it is not met. */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  ZELVEM_HOSTED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validates process env at startup (wired into `ConfigModule.forRoot`).
 * Throws listing every offending variable so a misconfigured deploy fails
 * loudly instead of limping along.
 *
 * @param env - The raw process environment
 * @returns The parsed, typed environment
 */
export function validateEnv(env: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(env)
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${problems}`)
  }
  return parsed.data
}
