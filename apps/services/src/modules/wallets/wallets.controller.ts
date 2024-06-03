import {
  Controller,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FieldInterceptor, FilterInterceptor } from '@app/common/interceptors';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { ParseIdPipe, ValidationPipe } from '@app/common/pipes';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Action, Resource, Scope } from '@wenex/sdk/common';
import { SetPolicy, SetScope } from '@app/common/metadatas';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { Headers } from '@app/common/interfaces';
import { wrap } from '@app/common/utils';

import { WalletsService } from './wallets.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
export class WalletsController {
  constructor(readonly service: WalletsService) {}

  @MessagePattern('Before: GET /wallets/sync/?')
  @SetScope(Scope.SyncFinancialWallets)
  @SetPolicy(Action.Sync, Resource.FinancialWallets)
  @UseInterceptors(FieldInterceptor, FilterInterceptor)
  async sync(
    @Payload('headers') headers: Headers,
    @Payload('params', ParseIdPipe) id: string,
  ) {
    return wrap(await this.service.sync({ id }, headers), 'end');
  }
}
