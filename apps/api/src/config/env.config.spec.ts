import { describe, expect, it } from 'vitest'

import { validateEnv } from './env.config'

const validEnv = {
  DATABASE_URL: 'postgresql://localhost:5432/zelvem',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'a'.repeat(32),
}

describe('validateEnv', () => {
  it('accepts a valid env and applies defaults', () => {
    const env = validateEnv(validEnv)
    expect(env.PORT).toBe(3001)
    expect(env.NODE_ENV).toBe('development')
    expect(env.ZELVEM_HOSTED).toBe(false)
  })

  it('parses ZELVEM_HOSTED into a boolean', () => {
    const env = validateEnv({ ...validEnv, ZELVEM_HOSTED: 'true' })
    expect(env.ZELVEM_HOSTED).toBe(true)
  })

  it('refuses to start without JWT_SECRET, naming the variable', () => {
    const { JWT_SECRET: _omitted, ...incomplete } = validEnv
    expect(() => validateEnv(incomplete)).toThrow(/JWT_SECRET/)
  })

  it('rejects a JWT_SECRET shorter than 32 chars', () => {
    expect(() => validateEnv({ ...validEnv, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/)
  })
})
