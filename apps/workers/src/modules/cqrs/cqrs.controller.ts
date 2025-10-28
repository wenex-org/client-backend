import { Body, Controller, HttpStatus, Post, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { LoggerInterceptor } from '@app/common/core/interceptors';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { CqrsPayloadDto } from '@app/common/core/dto/cqrs';
import { AuthGuard } from '@app/common/core/guards/cqrs';
import { ValidationPipe } from '@app/common/core/pipes';
import { isAlive } from '@wenex/sdk/common/core/utils';
import { assertion } from '@app/common/core/utils';
import { APP } from '@app/common';

import { CqrsService } from './cqrs.service';

@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
@Controller()
export class CqrsController {
  constructor(readonly service: CqrsService) {}

  @Post('cqrs')
  async cqrs(@Body() payload: CqrsPayloadDto) {
    const serviceUrl = `http://${APP.SERVICES.HOST}:${APP.SERVICES.API_PORT}`;
    assertion(await isAlive(serviceUrl), 'Service is not alive', HttpStatus.SERVICE_UNAVAILABLE);

    return this.service.cqrs(payload);
  }
}
