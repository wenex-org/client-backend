import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AuthenticationRequest } from '@wenex/sdk/common';
import { AllExceptionsFilter } from '@app/common/filters';
import { wrap } from '@app/common/utils';

import { AuthService } from './auth.service';

@Controller()
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthController {
  constructor(readonly service: AuthService) {}

  @MessagePattern('Before: POST /auth/token')
  getNotifications(@Payload('data') data: AuthenticationRequest) {
    return wrap(this.service.token(data), 'body');
  }
}
