import {
  AuthenticationRequest,
  AuthorizationCanRequest,
  AuthorizationPolicyRequest,
  Token,
} from '@wenex/sdk/common';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { getHeaders, setHeaders } from '@app/common/utils';
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

    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authentication.token(data, {
      headers: getHeaders(this.req),
    });

    this.req.res.status(status);
    setHeaders(headers, this.req.res);
    return res;
  }

  async verify(data: Token) {
    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authentication.verify(data, {
      headers: getHeaders(this.req),
    });

    this.req.res.status(status);
    setHeaders(headers, this.req.res);
    return res;
  }

  async logout(data: Token) {
    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authentication.logout(data, {
      headers: getHeaders(this.req),
    });

    this.req.res.status(status);
    setHeaders(headers, this.req.res);
    return res;
  }

  async can(data: AuthorizationCanRequest) {
    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authorization.can(data, {
      headers: getHeaders(this.req),
    });

    this.req.res.status(status);
    setHeaders(headers, this.req.res);
    return res;
  }

  async policy(data: AuthorizationPolicyRequest) {
    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authorization.policy(data, {
      headers: getHeaders(this.req),
    });

    this.req.res.status(status);
    setHeaders(headers, this.req.res);
    return res;
  }
}
