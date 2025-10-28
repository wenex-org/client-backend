import { MONGO_CONFIG, MONGO_OPTIONS, NATS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { NATS_GATEWAY } from '@app/common/core/constants';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from '@app/module/health';
import { Module } from '@nestjs/common';

import { CqrsModule } from './modules/cqrs';

@Module({
  imports: [
    PrometheusModule.register(),
    SentryModule.forRoot(SENTRY_CONFIG()),
    MongooseModule.forRoot(MONGO_CONFIG(), MONGO_OPTIONS()),
    HealthModule.forRoot(['redis', 'mongo', 'nats', 'service']),

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

    ...[CqrsModule],
  ],
})
export class AppModule {}
