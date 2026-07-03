import { describe, expect, it } from 'vitest'

import { withPgbouncerParams } from './pool'

describe('withPgbouncerParams', () => {
  it('appends pgbouncer=true and the default connection limit', () => {
    const url = withPgbouncerParams('postgresql://user:pass@localhost:5432/zelvem')
    expect(url).toContain('pgbouncer=true')
    expect(url).toContain('connection_limit=5')
  })

  it('preserves existing query params and accepts a custom limit', () => {
    const url = withPgbouncerParams('postgresql://localhost:5432/db?schema=public', 10)
    expect(url).toContain('schema=public')
    expect(url).toContain('connection_limit=10')
  })
})
