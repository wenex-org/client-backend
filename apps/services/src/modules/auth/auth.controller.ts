import { Controller, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthenticationRequest } from '@wenex/sdk/common/interfaces/auth';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { Headers } from '@wenex/sdk/common/core/interfaces';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { SyncData } from '@app/common/core/interfaces';
import { wrap } from '@wenex/sdk/common/core/utils';
import { from, map, Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthController {
  constructor(readonly service: AuthService) {}

  @MessagePattern('before.post.auth.token')
  token(@Payload('headers') headers: Headers, @Payload('data') data: AuthenticationRequest): Observable<SyncData> {
    return from(this.service.token(data, headers)).pipe(map((val) => wrap(val, (obj) => ({ body: obj }))));
  }
}
