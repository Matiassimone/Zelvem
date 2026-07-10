import argon2 from 'argon2'
import { err, ok } from 'neverthrow'
import { beforeAll, describe, expect, it } from 'vitest'

import { verifyAccessToken } from '@zelvem/auth'
import { AppError } from '@zelvem/core'
import type { User } from '@zelvem/database'

import type { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'

const config = { secret: 'test-secret-that-is-32-chars-long!!' }
let user: User

beforeAll(async () => {
  user = {
    id: 'user-1',
    email: 'test@zelvem.com',
    passwordHash: await argon2.hash('correct-password'),
    createdAt: new Date(),
  }
})

function serviceWith(found: boolean): AuthService {
  const repo = {
    findByEmail: async () => (found ? ok(user) : err(new AppError('USER_NOT_FOUND'))),
  } as unknown as AuthRepository
  return new AuthService(repo, config)
}

describe('AuthService.login', () => {
  it('returns a token pair whose access token verifies to the user id', async () => {
    const result = await serviceWith(true).login({
      email: user.email,
      password: 'correct-password',
    })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      const session = verifyAccessToken(result.value.accessToken, config)
      expect(session.isOk()).toBe(true)
      if (session.isOk()) expect(session.value.userId).toBe('user-1')
    }
  })

  it('rejects a wrong password with INVALID_CREDENTIALS', async () => {
    const result = await serviceWith(true).login({ email: user.email, password: 'wrong-password' })
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('rejects an unknown email with INVALID_CREDENTIALS — never USER_NOT_FOUND', async () => {
    const result = await serviceWith(false).login({
      email: 'ghost@zelvem.com',
      password: 'whatever!',
    })
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error.code).toBe('INVALID_CREDENTIALS')
  })
})

describe('AuthService.refresh', () => {
  it('rotates a valid refresh token into a fresh pair', async () => {
    const login = await serviceWith(true).login({ email: user.email, password: 'correct-password' })
    if (!login.isOk()) throw new Error('login failed')
    const rotated = serviceWith(true).refresh(login.value.refreshToken)
    expect(rotated.isOk()).toBe(true)
  })

  it('rejects garbage with an error code', () => {
    const rotated = serviceWith(true).refresh('not-a-token')
    expect(rotated.isErr()).toBe(true)
    if (rotated.isErr()) expect(rotated.error.code).toBe('TOKEN_INVALID')
  })
})
