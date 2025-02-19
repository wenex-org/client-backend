import { Controller, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { ConfirmationDto, RegisterDto } from '@app/common/dto/auth/register';
import { AuthenticationRequest } from '@wenex/sdk/common/interfaces/auth';
import { LoggerInterceptor } from '@app/common/core/interceptors';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { Headers } from '@wenex/sdk/common/core/interfaces';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { SyncData } from '@app/common/core/interfaces';
import { mapTo } from '@app/common/core/utils';
import { from, Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
export class AuthController {
  constructor(readonly service: AuthService) {}

  @MessagePattern('before.post.auth.token')
  token(@Payload('headers') headers: Headers, @Payload('data') data: AuthenticationRequest): Observable<SyncData> {
    return from(this.service.token(data, headers)).pipe(mapTo('body'));
  }

  @MessagePattern('before.post.auth.register')
  register(@Payload('headers') headers: Headers, @Payload('data') data: RegisterDto): Observable<SyncData> {
    return from(this.service.register(data, headers)).pipe(mapTo('end'));
  }

  @MessagePattern('before.post.auth.confirmation')
  confirmation(@Payload('headers') headers: Headers, @Payload('data') data: ConfirmationDto): Observable<SyncData> {
    return from(this.service.confirmation(data, headers)).pipe(mapTo('end'));
  }
}
