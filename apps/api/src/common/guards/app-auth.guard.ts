import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { AUTH_CONFIG, type AuthConfig, JwtAuthGuard } from '@zelvem/auth'

import { IS_PUBLIC_KEY } from './public.decorator'

/**
 * Global auth guard: every route requires a verified bearer token unless
 * explicitly marked with `@Public()`. Registered as `APP_GUARD`, so auth is
 * enforced by default — never by ad-hoc controller checks.
 */
@Injectable()
export class AppAuthGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_CONFIG) config: AuthConfig,
    private readonly reflector: Reflector,
  ) {
    super(config)
  }

  override canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true
    return super.canActivate(context)
  }
}
