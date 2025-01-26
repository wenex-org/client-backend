import { Controller, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { FieldInterceptor, FilterInterceptor } from '@app/common/core/interceptors/flow';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { SetPolicy, SetScope } from '@app/common/core/metadatas';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { Headers } from '@wenex/sdk/common/core/interfaces';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { SyncData } from '@app/common/core/interfaces';
import { Mail } from '@app/common/interfaces/touch';
import { MailDto } from '@app/common/dto/touch';
import { Action } from '@wenex/sdk/common/core';
import { mapTo } from '@app/common/core/utils';
import { from, Observable } from 'rxjs';

import { MailsService } from './mails.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
export class MailsController {
  constructor(readonly service: MailsService) {}

  @MessagePattern('before.post.mails.send')
  @SetScope('send:touch:mails')
  @SetPolicy(Action.Send, 'touch:mails')
  @UseInterceptors(FieldInterceptor, FilterInterceptor)
  send(@Payload('data') data: MailDto, @Payload('headers') headers: Headers): Observable<SyncData> {
    return from(this.service.send(data as Mail, headers)).pipe(mapTo('end'));
  }
}
