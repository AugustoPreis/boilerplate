import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { appConfig, databaseConfig } from './core/config';
import { validateConfig } from './core/config/config.validation';
import { TypeOrmConfigModule } from './core/database/typeorm.module';
import { I18nModule } from './core/i18n/i18n.module';
import { RedisModule } from './core/redis/redis.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { AppCacheModule } from './shared/cache/cache.module';
import { AuditInterceptor } from './shared/interceptors/audit.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
      load: [appConfig, databaseConfig],
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
    AppCacheModule,
    SharedModule,
    HealthModule,
    AuditModule,
  ],
  providers: [
    // JwtAuthGuard/RolesGuard não são registrados globalmente ainda: dependem
    // da estratégia Passport 'jwt' que só existe a partir do AuthModule (Fase 2).
    // Os guards já existem em @shared/guards como infraestrutura, mas ativá-los
    // aqui sem uma estratégia registrada quebraria toda rota não pública.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
