import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';

import { AuthService } from './auth.service';

@Controller()
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AuthController {
  constructor(readonly service: AuthService) {}

  @MessagePattern('auth.register')
  getNotifications(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log(context.getMessage());
    this.service.register(data);
  }
}
