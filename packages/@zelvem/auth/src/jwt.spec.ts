import { describe, expect, it } from 'vitest'

import type { AuthConfig } from './jwt'
import { issueTokenPair, rotateTokenPair, verifyAccessToken } from './jwt'

const config: AuthConfig = { secret: 'test-secret' }

describe('issueTokenPair + verifyAccessToken', () => {
  it('round-trips: issued access token verifies into a session', () => {
    const pair = issueTokenPair('user-1', config)
    const session = verifyAccessToken(pair.accessToken, config)

    expect(session.isOk()).toBe(true)
    if (session.isOk()) {
      expect(session.value.userId).toBe('user-1')
      expect(session.value.expiresAt.getTime()).toBeGreaterThan(Date.now())
    }
  })

  it('rejects a garbage token with TOKEN_INVALID', () => {
    const session = verifyAccessToken('not-a-jwt', config)
    expect(session.isErr()).toBe(true)
    if (session.isErr()) expect(session.error.code).toBe('TOKEN_INVALID')
  })

  it('rejects a token signed with a different secret', () => {
    const pair = issueTokenPair('user-1', { secret: 'other-secret' })
    const session = verifyAccessToken(pair.accessToken, config)
    expect(session.isErr()).toBe(true)
    if (session.isErr()) expect(session.error.code).toBe('TOKEN_INVALID')
  })

  it('rejects an expired token with TOKEN_EXPIRED', () => {
    const pair = issueTokenPair('user-1', { ...config, accessTtl: '-1s' })
    const session = verifyAccessToken(pair.accessToken, config)
    expect(session.isErr()).toBe(true)
    if (session.isErr()) expect(session.error.code).toBe('TOKEN_EXPIRED')
  })

  it('rejects a refresh token used as an access token', () => {
    const pair = issueTokenPair('user-1', config)
    const session = verifyAccessToken(pair.refreshToken, config)
    expect(session.isErr()).toBe(true)
    if (session.isErr()) expect(session.error.code).toBe('TOKEN_INVALID')
  })
})

describe('rotateTokenPair', () => {
  it('issues a fresh pair from a valid refresh token', () => {
    const pair = issueTokenPair('user-1', config)
    const rotated = rotateTokenPair(pair.refreshToken, config)

    expect(rotated.isOk()).toBe(true)
    if (rotated.isOk()) {
      const session = verifyAccessToken(rotated.value.accessToken, config)
      expect(session.isOk()).toBe(true)
      if (session.isOk()) expect(session.value.userId).toBe('user-1')
    }
  })

  it('rejects an access token used as a refresh token', () => {
    const pair = issueTokenPair('user-1', config)
    const rotated = rotateTokenPair(pair.accessToken, config)
    expect(rotated.isErr()).toBe(true)
    if (rotated.isErr()) expect(rotated.error.code).toBe('TOKEN_INVALID')
  })

  it('rejects an expired refresh token with TOKEN_EXPIRED', () => {
    const pair = issueTokenPair('user-1', { ...config, refreshTtl: '-1s' })
    const rotated = rotateTokenPair(pair.refreshToken, config)
    expect(rotated.isErr()).toBe(true)
    if (rotated.isErr()) expect(rotated.error.code).toBe('TOKEN_EXPIRED')
  })
})
