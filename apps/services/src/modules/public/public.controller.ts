import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { Headers } from '@app/common/interfaces';
import { ParseIdPipe } from '@app/common/pipes';
import { wrap } from '@app/common/utils';

import { PublicService } from './public.service';

@Controller()
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
