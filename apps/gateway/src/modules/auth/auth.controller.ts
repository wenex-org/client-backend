import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  AuthenticationResponseSerializer,
  AuthorizationCanResponseSerializer,
  AuthorizationPolicyResponseSerializer,
  JwtTokenSerializer,
  ResultSerializer,
} from '@app/common/serializers';
import {
  AuthenticationRequestDto,
  AuthorizationCanRequestDto,
  AuthorizationPolicyRequestDto,
  TokenDto,
} from '@app/common/dto';
import { LoggerInterceptor } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from '@app/common/pipes';

import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  token(
    @Body() data: AuthenticationRequestDto,
  ): Promise<AuthenticationResponseSerializer> {
    return this.authService.token(data);
  }

  @Post('verify')
  @ApiBearerAuth()
  verify(@Body() data: TokenDto): Promise<JwtTokenSerializer> {
    return this.authService.verify(data);
  }

  @Post('can')
  @ApiBearerAuth()
  can(
    @Body() data: AuthorizationCanRequestDto,
  ): Promise<AuthorizationCanResponseSerializer> {
    return this.authService.can(data);
  }

  @Post('policy')
  @ApiBearerAuth()
  policy(
    @Body() data: AuthorizationPolicyRequestDto,
  ): Promise<AuthorizationPolicyResponseSerializer> {
    return this.authService.policy(data);
  }

  @Post('logout')
  @ApiBearerAuth()
  logout(@Body() data: TokenDto): Promise<ResultSerializer> {
    return this.authService.logout(data);
  }
}
