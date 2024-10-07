import { MONGO_CONFIG, MONGO_OPTIONS, SENTRY_CONFIG } from '@app/common/envs';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from '@app/health';
import { Module } from '@nestjs/common';

import { MirrorModule } from './modules/mirror';

@Module({
  imports: [
    PrometheusModule.register(),
    SentryModule.forRoot(SENTRY_CONFIG()),
    HealthModule.forRoot(['disk', 'memory', 'mongo']),
    MongooseModule.forRoot(MONGO_CONFIG(), MONGO_OPTIONS()),

    ...[MirrorModule],
  ],
})
export class AppModule {}
