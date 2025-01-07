import { MONGO_CONFIG, MONGO_OPTIONS, SENTRY_CONFIG } from '@app/common/core/envs';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from '@app/module/health';
import { Module } from '@nestjs/common';

import { CqrsModule } from './modules/cqrs';

@Module({
  imports: [
    PrometheusModule.register(),
    SentryModule.forRoot(SENTRY_CONFIG()),
    HealthModule.forRoot(['disk', 'memory', 'mongo']),
    MongooseModule.forRoot(MONGO_CONFIG(), MONGO_OPTIONS()),

    ...[CqrsModule],
  ],
})
export class AppModule {}
