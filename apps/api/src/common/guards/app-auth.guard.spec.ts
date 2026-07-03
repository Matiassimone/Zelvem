import 'reflect-metadata'

import { type ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { describe, expect, it } from 'vitest'

import { issueTokenPair } from '@zelvem/auth'

import { AppAuthGuard } from './app-auth.guard'
import { Public } from './public.decorator'

const config = { secret: 'test-secret-that-is-32-chars-long!!' }

function contextFor(handler: () => void, authorization?: string): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization } }) }),
  } as unknown as ExecutionContext
}

describe('AppAuthGuard', () => {
  const guard = new AppAuthGuard(config, new Reflector())

  it('lets a @Public() route through without a token', () => {
    class Dummy {
      @Public()
      handler(): void {}
    }
    const ctx = contextFor(Dummy.prototype.handler)
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('rejects a non-public route without a token', () => {
    const ctx = contextFor(function handler(): void {})
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException)
  })

  it('accepts a non-public route with a valid bearer token', () => {
    const pair = issueTokenPair('user-1', config)
    const ctx = contextFor(function handler(): void {}, `Bearer ${pair.accessToken}`)
    expect(guard.canActivate(ctx)).toBe(true)
  })
})
