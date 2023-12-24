import { MONGO_CONFIG, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/configs';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from '@app/health';
import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';
import { SdkModule } from '@app/sdk';

import { AuthModule } from './modules/auth';
import { PublicModule } from './modules/public';

@Module({
  imports: [
    SdkModule.forRoot({
      baseURL: process.env.PLATFORM_URL,
      timeout: +(process.env.TIMEOUT || 30000),
      headers: { 'x-api-key': process.env.API_KEY },
    }),

    PrometheusModule.register(),
    RedisModule.forRoot(REDIS_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),
    MongooseModule.forRoot(MONGO_CONFIG()),
    HealthModule.forRoot(['disk', 'memory', 'redis']),

    ...[AuthModule, PublicModule],
  ],
})
export class AppModule {}
