import { ALTCHA_CONFIG, NATS_CONFIG, PLATFORM_CONFIG, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { NATS_GATEWAY } from '@app/common/core/constants';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { AltchaModule } from '@app/module/altcha';
import { HealthModule } from '@app/module/health';
import { RedisModule } from '@app/module/redis';
import { SdkModule } from '@app/module/sdk';
import { Module } from '@nestjs/common';

import { MODULES } from './modules';

@Module({
  imports: [
    PrometheusModule.register(),
    RedisModule.forRoot(REDIS_CONFIG()),
    AltchaModule.forRoot(ALTCHA_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),

    ClientsModule.register({
      isGlobal: true,
      clients: [
        {
          name: NATS_GATEWAY,
          options: NATS_CONFIG(),
          transport: Transport.NATS,
        },
      ],
    }),

    SdkModule.forRoot(PLATFORM_CONFIG()),
    HealthModule.forRoot(['redis', 'nats', 'service', 'platform']),

    ...[...MODULES],
  ],
})
export class AppModule {}
