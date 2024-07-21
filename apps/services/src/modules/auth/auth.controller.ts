import { OAuthRequestDto, RegistrationDto, VerificationDto } from '@app/common/dto';
import { Controller, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AuthenticationRequest } from '@wenex/sdk/common';
import { AllExceptionsFilter } from '@app/common/filters';
import { ValidationPipe } from '@app/common/pipes';
import { Headers } from '@app/common/interfaces';
import { wrap } from '@app/common/utils';

import { AuthService } from './auth.service';

@Controller()
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthController {
  constructor(readonly service: AuthService) {}

  @MessagePattern('Before: POST /auth/token')
  async token(@Payload('headers') headers: Headers, @Payload('data') data: AuthenticationRequest) {
    return wrap(await this.service.token(data, headers), 'body');
  }

  @MessagePattern('Before: POST /auth/oauth')
  async oauth(@Payload('headers') headers: Headers, @Payload('data') data: OAuthRequestDto) {
    return wrap(await this.service.oauth(data, headers), 'end');
  }

  @MessagePattern('Before: POST /auth/registration')
  async registration(@Payload('headers') headers: Headers, @Payload('data') data: RegistrationDto) {
    return wrap(await this.service.registration(data, headers), 'end');
  }

  @MessagePattern('Before: POST /auth/verification')
  async verification(@Payload('headers') headers: Headers, @Payload('data') data: VerificationDto) {
    return wrap(await this.service.verification(data, headers), 'end');
  }
}
