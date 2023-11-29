import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { SENTRY_CONFIG } from '@app/common/configs';
import { HealthModule } from '@app/health';
import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth';

@Module({
  imports: [
    PrometheusModule.register(),
    SentryModule.forRoot(SENTRY_CONFIG()),
    HealthModule.forRoot(['disk', 'memory']),

    ...[AuthModule],
  ],
})
export class AppModule {}
