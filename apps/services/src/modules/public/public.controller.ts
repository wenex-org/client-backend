import { Controller, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { ParseIdPipe, ValidationPipe } from '@app/common/pipes';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { Headers } from '@app/common/interfaces';
import { wrap } from '@app/common/utils';

import { PublicService } from './public.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class PublicController {
  constructor(readonly service: PublicService) {}

  @MessagePattern('Before: GET /public/host/?')
  async getHost(
    @Payload('headers') headers: Headers,
    @Payload('params', ParseIdPipe) id: string,
  ) {
    return wrap(await this.service.getHost(id, headers), 'end');
  }
}
