import { Body, Controller, Post, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { LoggerInterceptor } from '@app/common/core/interceptors';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { CqrsPayloadDto } from '@app/common/core/dto/cqrs';
import { AuthGuard } from '@app/common/core/guards/cqrs';
import { ValidationPipe } from '@app/common/core/pipes';

import { CqrsService } from './cqrs.service';

@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
@Controller()
export class CqrsController {
  constructor(readonly service: CqrsService) {}

  @Post('cqrs')
  cqrs(@Body() payload: CqrsPayloadDto) {
    return this.service.cqrs(payload);
  }
}
