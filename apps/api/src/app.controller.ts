import { Controller, Get } from '@nestjs/common'

import { Public } from './common/guards/public.decorator'

@Controller()
export class AppController {
  /** Liveness probe for container orchestration. Public by design. */
  @Public()
  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' }
  }
}
