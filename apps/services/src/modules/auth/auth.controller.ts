import { Controller, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthenticationRequest } from '@wenex/sdk/common/interfaces/auth';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { SyncData } from '@app/common/core/interfaces';
import { wrap } from '@wenex/sdk/common/core/utils';
import { map, Observable, of } from 'rxjs';

import { AuthService } from './auth.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthController {
  constructor(readonly service: AuthService) {}

  @MessagePattern('before.post.auth.token')
  token(@Payload('data') data: AuthenticationRequest): Observable<SyncData> {
    return of(this.service.token(data)).pipe(map((val) => wrap(val, (obj) => ({ body: obj }))));
  }
}
