import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { appConfig, authConfig, databaseConfig, mailConfig } from './core/config';
import { validateConfig } from './core/config/config.validation';
import { TypeOrmConfigModule } from './core/database/typeorm.module';
import { I18nModule } from './core/i18n/i18n.module';
import { MailModule } from './core/mail/mail.module';
import { RedisModule } from './core/redis/redis.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { AppCacheModule } from './shared/cache/cache.module';
import { RequestContextInterceptor } from './shared/context/request-context.interceptor';
import { CsrfGuard } from './shared/guards/csrf.guard';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { PermissionsGuard } from './shared/guards/permissions.guard';
import { AppThrottlerGuard } from './shared/guards/throttler.guard';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
      load: [appConfig, authConfig, databaseConfig, mailConfig],
      envFilePath: ['../../.env.local', '../../.env', '.env.local', '.env'],
    }),
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

          transport:
            process.env.NODE_ENV !== 'production'
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                  },
                }
              : undefined,

          customSuccessMessage(req, res, responseTime) {
            return `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`;
          },

          customErrorMessage(req, res, error) {
            return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`;
          },

          serializers: {
            req: () => undefined,
            res: () => undefined,
          },
        },

        forRoutes: [{ path: '{*path}', method: RequestMethod.ALL }],
      }),
    }),
    I18nModule,
    TypeOrmConfigModule,
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    RedisModule,
    MailModule,
    AppCacheModule,
    SharedModule,
    HealthModule,
    UsersModule,
    RolesModule,
    AuthModule,
    AuditModule,
  ],
  providers: [
    // Be careful with the order of the guards, as they are executed in the order they are provided.
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
