import { ConfirmationDto, OAuthDto, OtpDto, RegisterDto, RepassDto } from '@app/common/dto/auth';
import { Controller, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthenticationRequest } from '@wenex/sdk/common/interfaces/auth';
import { SyncData, SyncObject } from '@app/common/core/interfaces';
import { LoggerInterceptor } from '@app/common/core/interceptors';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { Headers } from '@wenex/sdk/common/core/interfaces';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { mapTo } from '@app/common/core/utils';
import { from, Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
export class AuthController {
  constructor(readonly service: AuthService) {}

  @MessagePattern('before.post.auth.otp')
  otp(@Payload('headers') headers: Headers, @Payload('data') data: OtpDto): Observable<SyncData> {
    return from(this.service.otp(data, headers)).pipe(mapTo('end'));
  }

  @MessagePattern('before.post.auth.token')
  token(@Payload('data') data: AuthenticationRequest & { captcha: string }): Observable<SyncObject<'body' | 'headers'>> {
    return from(this.service.token(data));
  }

  @MessagePattern('before.post.auth.oauth')
  oauth(@Payload('headers') headers: Headers, @Payload('data') data: OAuthDto): Observable<SyncData> {
    return from(this.service.oauth(data, headers)).pipe(mapTo('end'));
  }

  @MessagePattern('before.post.auth.repass')
  repass(@Payload('headers') headers: Headers, @Payload('data') data: RepassDto): Observable<SyncData> {
    return from(this.service.repass(data, headers)).pipe(mapTo('end'));
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
