import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { SENTRY_CONFIG } from '@app/common/configs';
import { HealthModule } from '@app/health';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PrometheusModule.register(),
    SentryModule.forRoot(SENTRY_CONFIG()),
    HealthModule.forRoot(['disk', 'memory', 'kafka']),
  ],
})
export class AppModule {}
