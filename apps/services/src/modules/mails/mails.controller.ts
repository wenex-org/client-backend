import {
  Controller,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FieldInterceptor, FilterInterceptor } from '@app/common/interceptors';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Action, Resource, Scope } from '@wenex/sdk/common';
import { SetPolicy, SetScope } from '@app/common/metadatas';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { EndSerializer } from '@app/common/serializers';
import { Headers, Mail } from '@app/common/interfaces';
import { ValidationPipe } from '@app/common/pipes';
import { MailDto } from '@app/common/dto';
import { wrap } from '@app/common/utils';

import { MailsService } from './mails.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
export class MailsController {
  constructor(readonly service: MailsService) {}

  @MessagePattern('Before: POST /mails/send')
  @SetScope(Scope.SendTouchMails)
  @SetPolicy(Action.Send, Resource.TouchMails)
  @UseInterceptors(FieldInterceptor, FilterInterceptor)
  async send(
    @Payload('data') data: MailDto,
    @Payload('headers') headers: Headers,
  ): Promise<EndSerializer<Mail>> {
    return wrap(await this.service.send(data as Mail, headers), 'end');
  }
}
