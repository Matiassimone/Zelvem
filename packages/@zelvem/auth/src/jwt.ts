import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken'
import { err, ok, type Result } from 'neverthrow'

import { AppError } from '@zelvem/core'

import type { Session } from './session'

/** Configuration for signing and verifying tokens. Wired by the app from its config module. */
export interface AuthConfig {
  /** HMAC secret used to sign and verify all tokens. */
  secret: string
  /** Access token lifetime (e.g. `'15m'`). */
  accessTtl?: string
  /** Refresh token lifetime (e.g. `'30d'`). */
  refreshTtl?: string
}

/** Access + refresh token pair returned on login and rotation. */
export interface TokenPair {
  accessToken: string
  refreshToken: string
}

const DEFAULT_ACCESS_TTL = '15m'
const DEFAULT_REFRESH_TTL = '30d'

type TokenType = 'access' | 'refresh'

function sign(userId: string, type: TokenType, secret: string, ttl: string): string {
  return jwt.sign({ sub: userId, type }, secret, {
    expiresIn: ttl as SignOptions['expiresIn'],
  })
}

function verify(token: string, type: TokenType, secret: string): Result<JwtPayload, AppError> {
  try {
    const payload = jwt.verify(token, secret)
    if (typeof payload === 'string' || payload.type !== type || typeof payload.sub !== 'string') {
      return err(new AppError('TOKEN_INVALID'))
    }
    return ok(payload)
  } catch (cause) {
    const code = cause instanceof jwt.TokenExpiredError ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    return err(new AppError(code))
  }
}

/**
 * Issues an access + refresh token pair for a user, e.g. on login.
 *
 * @param userId - The unique identifier of the user
 * @param config - Signing secret and optional TTL overrides
 */
export function issueTokenPair(userId: string, config: AuthConfig): TokenPair {
  return {
    accessToken: sign(userId, 'access', config.secret, config.accessTtl ?? DEFAULT_ACCESS_TTL),
    refreshToken: sign(userId, 'refresh', config.secret, config.refreshTtl ?? DEFAULT_REFRESH_TTL),
  }
}

/**
 * Verifies an access token and decodes it into a session.
 *
 * @param token - The bearer token presented by the client
 * @param config - Signing secret and optional TTL overrides
 * @returns Ok with the session, or Err(`TOKEN_EXPIRED` | `TOKEN_INVALID`)
 */
export function verifyAccessToken(token: string, config: AuthConfig): Result<Session, AppError> {
  return verify(token, 'access', config.secret).map((payload) => ({
    userId: payload.sub as string,
    issuedAt: new Date((payload.iat ?? 0) * 1000),
    expiresAt: new Date((payload.exp ?? 0) * 1000),
  }))
}

/**
 * Refresh strategy: verifies a refresh token and issues a brand-new pair,
 * so refresh tokens rotate on every use.
 *
 * @param refreshToken - The refresh token presented by the client
 * @param config - Signing secret and optional TTL overrides
 * @returns Ok with a fresh pair, or Err(`TOKEN_EXPIRED` | `TOKEN_INVALID`)
 */
export function rotateTokenPair(
  refreshToken: string,
  config: AuthConfig,
): Result<TokenPair, AppError> {
  // ponytail: stateless rotation — old refresh tokens stay valid until they
  // expire. Add a jti claim + Redis denylist when revocation ("log out
  // everywhere") becomes a requirement.
  return verify(refreshToken, 'refresh', config.secret).map((payload) =>
    issueTokenPair(payload.sub as string, config),
  )
}
