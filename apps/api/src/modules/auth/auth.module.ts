import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AUTH_CONFIG, type AuthConfig } from '@zelvem/auth'

import type { Env } from '../../config/env.config'
import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'

/** Auth module — owns AUTH_CONFIG so both the service and the global guard resolve it. */
@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): AuthConfig => ({
        secret: config.get('JWT_SECRET', { infer: true }),
      }),
    },
    AuthService,
    AuthRepository,
  ],
  exports: [AUTH_CONFIG],
})
export class AuthModule {}
