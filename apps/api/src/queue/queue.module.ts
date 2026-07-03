import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { QUEUES } from '@zelvem/core'

/**
 * Queue setup: the API only enqueues jobs here — processing lives in
 * apps/workers. Payloads carry IDs, never user content.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = new URL(config.getOrThrow<string>('REDIS_URL'))
        return {
          connection: {
            host: redis.hostname,
            port: Number(redis.port || 6379),
            password: redis.password || undefined,
          },
        }
      },
    }),
    BullModule.registerQueue(...Object.values(QUEUES).map((name) => ({ name }))),
  ],
  exports: [BullModule],
})
export class QueueModule {}
