import { ALTCHA_CONFIG, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { AltchaModule } from '@app/module/altcha';
import { HealthModule } from '@app/module/health';
import { RedisModule } from '@app/module/redis';
import { Module } from '@nestjs/common';

import { ProxyModule } from './modules/proxy';

@Module({
  imports: [
    PrometheusModule.register(),
    RedisModule.forRoot(REDIS_CONFIG()),
    AltchaModule.forRoot(ALTCHA_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),
    HealthModule.forRoot(['redis', 'nats']),

    ...[ProxyModule],
  ],
})
export class AppModule {}
