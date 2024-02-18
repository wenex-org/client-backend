import { Controller, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Action, Resource, Scope } from '@wenex/sdk/common';
import { SetPolicy, SetScope } from '@app/common/metadatas';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { Headers } from '@app/common/interfaces';
import { wrap } from '@app/common/utils';

import { MailsService } from './mails.service';
import { FieldInterceptor, FilterInterceptor } from '@app/common/interceptors';

@Controller()
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
export class MailsController {
  constructor(readonly service: MailsService) {}

  @MessagePattern('Before: POST /mails/send')
  @SetScope(Scope.ReadClientBrokersWallet)
  @SetPolicy(Action.Read, Resource.ClientBrokersWallet)
  @UseInterceptors(FieldInterceptor, FilterInterceptor)
  async send(@Payload('data') data: any, @Payload('headers') headers: Headers) {
    return wrap(await this.service.send(data, headers), 'end');
  }
}
