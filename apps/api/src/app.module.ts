import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { LoggerModule } from 'nestjs-pino'

import { AppController } from './app.controller'
import { AppAuthGuard } from './common/guards/app-auth.guard'
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor'
import { type Env, validateEnv } from './config/env.config'
import { AuthModule } from './modules/auth/auth.module'
import { BlogModule } from './modules/blog/blog.module'
import { CalendarModule } from './modules/calendar/calendar.module'
import { EmailModule } from './modules/email/email.module'
import { FinanceModule } from './modules/finance/finance.module'
import { SocialModule } from './modules/social/social.module'
import { TodosModule } from './modules/todos/todos.module'
import { QueueModule } from './queue/queue.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        pinoHttp:
          config.get('NODE_ENV', { infer: true }) === 'production'
            ? {}
            : { transport: { target: 'pino-pretty' } },
      }),
    }),
    QueueModule,
    AuthModule,
    EmailModule,
    BlogModule,
    TodosModule,
    SocialModule,
    CalendarModule,
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: AppAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
  ],
})
export class AppModule {}
