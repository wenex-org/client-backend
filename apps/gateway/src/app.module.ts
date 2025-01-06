import { REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { HealthModule } from '@app/module/health';
import { RedisModule } from '@app/module/redis';
import { Module } from '@nestjs/common';

import { ProxyModule } from './modules/proxy';

@Module({
  imports: [
    PrometheusModule.register(),
    RedisModule.forRoot(REDIS_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),
    HealthModule.forRoot(['disk', 'memory', 'redis']),

    ...[ProxyModule],
  ],
})
export class AppModule {}
