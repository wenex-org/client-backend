import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthService } from './health.service';
import { HealthCheckOptions } from './health.type';
import { HEALTH_CHECK_OPTIONS } from './health.const';
import { HealthController } from './health.controller';

@Module({})
export class HealthModule {
  static forRoot(options?: HealthCheckOptions): DynamicModule {
    return {
      module: HealthModule,
      imports: [TerminusModule],
      providers: [
        {
          provide: HEALTH_CHECK_OPTIONS,
          useValue: options,
        },
        HealthService,
      ],
      controllers: [HealthController],
      exports: [HealthService],
    };
  }
}
