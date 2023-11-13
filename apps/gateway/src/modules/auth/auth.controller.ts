import {
  AuthenticationRequest,
  AuthorizationCanRequest,
  AuthorizationPolicyRequest,
  Token,
} from '@wenex/sdk/common/interfaces';
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { LoggerInterceptor } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  token(@Body() data: AuthenticationRequest) {
    return this.authService.token(data);
  }

  @Post('verify')
  verify(@Body() data: Token) {
    return this.authService.verify(data);
  }

  @Post('can')
  can(@Body() data: AuthorizationCanRequest) {
    return this.authService.can(data);
  }

  @Post('policy')
  policy(@Body() data: AuthorizationPolicyRequest) {
    return this.authService.policy(data);
  }

  @Post('logout')
  logout(@Body() data: Token) {
    return this.authService.logout(data);
  }
}
