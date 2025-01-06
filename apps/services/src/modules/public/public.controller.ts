import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { Headers } from '@wenex/sdk/common/core/interfaces';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { SyncData } from '@app/common/core/interfaces';
import { ParseIdPipe } from '@app/common/core/pipes';
import { wrap } from '@wenex/sdk/common/core/utils';
import { from, map, Observable } from 'rxjs';

import { PublicService } from './public.service';

@Controller()
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class PublicController {
  constructor(readonly service: PublicService) {}

  @MessagePattern('before.get.public.?.agent')
  agent(@Payload('headers') headers: Headers, @Payload('params', ParseIdPipe) id: string): Observable<SyncData> {
    return from(this.service.agent(id, headers)).pipe(map((val) => wrap(val, (obj) => ({ end: obj }))));
  }
}
