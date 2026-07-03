import { type CustomDecorator, SetMetadata } from '@nestjs/common'

/** Metadata key read by {@link AppAuthGuard} to skip authentication. */
export const IS_PUBLIC_KEY = 'zelvem:is_public'

/**
 * Marks a route or controller as public — no bearer token required.
 * Reserved for login, refresh and health endpoints; everything else goes
 * through the global auth guard.
 */
export function Public(): CustomDecorator<string> {
  return SetMetadata(IS_PUBLIC_KEY, true)
}
