import { ALTCHA_CONFIG, PLATFORM_CONFIG, REDIS_CONFIG, SENTRY_CONFIG } from '@app/common/core/envs';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { AltchaModule } from '@app/module/altcha';
import { BackupModule } from '@app/module/backup';
import { HealthModule } from '@app/module/health';
import { RedisModule } from '@app/module/redis';
import { SdkModule } from '@app/module/sdk';
import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth';
import { TouchModule } from './modules/touch';
import { PublicModule } from './modules/public';

@Module({
  imports: [
    PrometheusModule.register(),
    RedisModule.forRoot(REDIS_CONFIG()),
    AltchaModule.forRoot(ALTCHA_CONFIG()),
    SentryModule.forRoot(SENTRY_CONFIG()),

    BackupModule.forRoot(),
    SdkModule.forRoot(PLATFORM_CONFIG()),
    HealthModule.forRoot(['redis', 'sdk']),

    ...[AuthModule, PublicModule, TouchModule],
  ],
})
export class AppModule {}
