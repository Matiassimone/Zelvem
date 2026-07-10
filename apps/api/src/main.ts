import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pino'

import { runMigrations } from '@zelvem/database'

import { AppModule } from './app.module'
import type { Env } from './config/env.config'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const logger = app.get(Logger)
  app.useLogger(logger)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))

  const config = app.get(ConfigService<Env, true>)

  const migrated = await runMigrations(config.get('DATABASE_URL', { infer: true }))
  if (migrated.isErr()) {
    logger.error(`Database migration failed: ${migrated.error.message}`)
    process.exit(1)
  }

  await app.listen(config.get('PORT', { infer: true }))
}

void bootstrap()
