import {
  AuthenticationRequest,
  AuthorizationCanRequest,
  AuthorizationPolicyRequest,
  Token,
} from '@wenex/sdk/common';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { getHeaders } from '@app/common/utils';
import { REQUEST } from '@nestjs/core';
import { SdkService } from '@app/sdk';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private readonly sdkService: SdkService,
    @Inject(REQUEST) private readonly req: Request,
  ) {}

  async token(data: AuthenticationRequest) {
    data.app_id = process.env.APP_ID;
    data.client_id = process.env.CLIENT_ID;
    data.client_secret = process.env.CLIENT_SECRET;
    data.strict = !process.env.STRICT_TOKEN?.includes('false');

    return await this.sdkService.auth.authentication.token(data, {
      headers: getHeaders(this.req),
    });
  }

  async verify(data: Token) {
    return await this.sdkService.auth.authentication.verify(data, {
      headers: getHeaders(this.req),
    });
  }

  async logout(data: Token) {
    return await this.sdkService.auth.authentication.logout(data, {
      headers: getHeaders(this.req),
    });
  }

  async can(data: AuthorizationCanRequest) {
    return await this.sdkService.auth.authorization.can(data, {
      headers: getHeaders(this.req),
    });
  }

  async policy(data: AuthorizationPolicyRequest) {
    return await this.sdkService.auth.authorization.policy(data, {
      headers: getHeaders(this.req),
    });
  }
}
