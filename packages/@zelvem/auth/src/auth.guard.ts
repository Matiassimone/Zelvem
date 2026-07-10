import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { type AuthConfig, verifyAccessToken } from './jwt'
import type { Session } from './session'

/** Injection token the consuming app uses to provide the {@link AuthConfig}. */
export const AUTH_CONFIG = 'ZELVEM_AUTH_CONFIG'

/** Request shape after the guard has run: `session` is attached and verified. */
export interface AuthenticatedRequest {
  headers: Record<string, string | undefined>
  session?: Session
}

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the
 * decoded session to `request.session`. Auth lives in guards, never in
 * ad-hoc controller checks.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_CONFIG) private readonly config: AuthConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const header = request.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined
    if (!token) throw new UnauthorizedException('MISSING_TOKEN')

    const session = verifyAccessToken(token, this.config)
    if (session.isErr()) throw new UnauthorizedException(session.error.code)

    request.session = session.value
    return true
  }
}
