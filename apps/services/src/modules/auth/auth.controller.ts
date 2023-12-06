import { Controller, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AuthenticationRequest } from '@wenex/sdk/common';
import { AllExceptionsFilter } from '@app/common/filters';
import { ValidationPipe } from '@app/common/pipes';
import { OAuthRequestDto } from '@app/common/dto';
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
  token(@Payload('data') data: AuthenticationRequest) {
    return wrap(this.service.token(data), 'body');
  }

  @MessagePattern('Before: POST /auth/oauth')
  async oauth(
    @Payload('headers') headers: Headers,
    @Payload('data') data: OAuthRequestDto,
  ) {
    return wrap(await this.service.oauth(data, headers), 'end');
  }
}
