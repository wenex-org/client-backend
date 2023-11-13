import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  AuthenticationRequest,
  AuthorizationRequest,
  TokenInterface,
} from 'platform-sdk/common/interfaces';
import { LoggerInterceptor } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
@UsePipes(ValidationPipe)
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  token(@Body() data: AuthenticationRequest) {
    return this.authService.token(data);
  }

  @Post('decrypt')
  decrypt(@Body() data: TokenInterface) {
    return this.authService.decrypt(data);
  }

  @Post('logout')
  logout(@Body() data: TokenInterface) {
    return this.authService.logout(data);
  }

  @Post('can')
  can(@Body() data: AuthorizationRequest) {
    return this.authService.can(data);
  }
}
