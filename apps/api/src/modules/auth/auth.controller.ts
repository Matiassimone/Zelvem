import { Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common'

import type { TokenPair } from '@zelvem/auth'
import {
  type LoginRequest,
  loginRequestSchema,
  type RefreshRequest,
  refreshRequestSchema,
} from '@zelvem/contracts'

import { Public } from '../../common/guards/public.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginRequestSchema)) body: LoginRequest,
  ): Promise<TokenPair> {
    const result = await this.auth.login(body)
    if (result.isErr()) throw new UnauthorizedException(result.error.code)
    return result.value
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body(new ZodValidationPipe(refreshRequestSchema)) body: RefreshRequest): TokenPair {
    const result = this.auth.refresh(body.refreshToken)
    if (result.isErr()) throw new UnauthorizedException(result.error.code)
    return result.value
  }
}
