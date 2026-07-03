import { Inject, Injectable } from '@nestjs/common'
import argon2 from 'argon2'
import { err, ok, type Result } from 'neverthrow'

import {
  AUTH_CONFIG,
  type AuthConfig,
  issueTokenPair,
  rotateTokenPair,
  type TokenPair,
} from '@zelvem/auth'
import type { LoginRequest } from '@zelvem/contracts'
import { AppError } from '@zelvem/core'

import { AuthRepository } from './auth.repository'

/** Verified against when the email is unknown, so timing does not leak account existence. */
let dummyHash: string | undefined
async function getDummyHash(): Promise<string> {
  dummyHash ??= await argon2.hash('zelvem-timing-equalizer')
  return dummyHash
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: AuthRepository,
    @Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig,
  ) {}

  /**
   * Verifies credentials and issues a token pair.
   * Unknown email and wrong password both resolve to `INVALID_CREDENTIALS`.
   */
  async login(input: LoginRequest): Promise<Result<TokenPair, AppError>> {
    const user = await this.users.findByEmail(input.email)
    if (user.isErr()) {
      await argon2.verify(await getDummyHash(), input.password).catch(() => false)
      return err(new AppError('INVALID_CREDENTIALS'))
    }
    const valid = await argon2.verify(user.value.passwordHash, input.password).catch(() => false)
    if (!valid) return err(new AppError('INVALID_CREDENTIALS'))
    return ok(issueTokenPair(user.value.id, this.authConfig))
  }

  /** Rotates a refresh token into a fresh pair (see @zelvem/auth for the strategy). */
  refresh(refreshToken: string): Result<TokenPair, AppError> {
    return rotateTokenPair(refreshToken, this.authConfig)
  }
}
