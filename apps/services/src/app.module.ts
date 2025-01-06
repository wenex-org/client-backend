import { PLATFORM_CONFIG, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { HealthModule } from '@app/module/health';
import { RedisModule } from '@app/module/redis';
import { SdkModule } from '@app/module/sdk';
import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth';

@Module({
  imports: [
    SdkModule.forRoot(PLATFORM_CONFIG()),

    PrometheusModule.register(),
    RedisModule.forRoot(REDIS_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),
    HealthModule.forRoot(['disk', 'memory', 'redis', 'mongo']),

    ...[AuthModule],
  ],
})
export class AppModule {}
