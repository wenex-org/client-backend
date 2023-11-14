import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { SENTRY_CONFIG } from '@app/common/configs';
import { HealthModule } from '@app/health';
import { Module } from '@nestjs/common';
import { SdkModule } from '@app/sdk';

import { AuthModule } from './modules/auth';
import { ProxyModule } from './modules/proxy';

@Module({
  imports: [
    SdkModule.forRoot({
      baseURL: process.env.PLATFORM_URL,
      timeout: +(process.env.TIMEOUT || 30000),
      headers: { 'x-api-key': process.env.API_KEY },
    }),
    PrometheusModule.register(),
    SentryModule.forRoot(SENTRY_CONFIG()),
    HealthModule.forRoot(['disk', 'memory', 'kafka']),

    ...[AuthModule, ProxyModule],
  ],
})
export class AppModule {}
