import { Controller, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { ParseIdPipe, ValidationPipe } from '@app/common/core/pipes';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { Headers } from '@wenex/sdk/common/core/interfaces';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { SyncData } from '@app/common/core/interfaces';
import { mapTo } from '@app/common/core/utils';
import { from, Observable } from 'rxjs';

import { PublicService } from './public.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class PublicController {
  constructor(readonly service: PublicService) {}

  @MessagePattern('before.get.public.?.agent')
  agent(@Payload('headers') headers: Headers, @Payload('params', ParseIdPipe) id: string): Observable<SyncData> {
    return from(this.service.agent(id, headers)).pipe(mapTo('end'));
  }
}
