import {
  AuthenticationRequest,
  AuthorizationCanRequest,
  AuthorizationPolicyRequest,
  Token,
} from '@wenex/sdk/common';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { SdkService } from '@app/sdk';
import { AxiosHeaders } from 'axios';
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
    data.strict = process.env.STRICT_TOKEN?.includes('true');

    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authentication.token(data, {
      headers: this.getHeaders(),
    });

    this.req.res.status(status);
    this.setHeaders(headers as AxiosHeaders);
    return res;
  }

  async verify(data: Token) {
    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authentication.verify(data, {
      headers: this.getHeaders(),
    });

    this.req.res.status(status);
    this.setHeaders(headers as AxiosHeaders);
    return res;
  }

  async logout(data: Token) {
    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authentication.logout(data, {
      headers: this.getHeaders(),
    });

    this.req.res.status(status);
    this.setHeaders(headers as AxiosHeaders);
    return res;
  }

  async can(data: AuthorizationCanRequest) {
    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authorization.can(data, {
      headers: this.getHeaders(),
    });

    this.req.res.status(status);
    this.setHeaders(headers as AxiosHeaders);
    return res;
  }

  async policy(data: AuthorizationPolicyRequest) {
    const {
      status,
      headers,
      data: res,
    } = await this.sdkService.auth.authorization.policy(data, {
      headers: this.getHeaders(),
    });

    this.req.res.status(status);
    this.setHeaders(headers as AxiosHeaders);
    return res;
  }

  protected getHeaders() {
    return {
      'x-user-ip': this.req.ip,
      'x-user-agent': this.req.headers['user-agent'],
      authorization: this.req.headers['authorization'],
    };
  }

  protected setHeaders(headers: AxiosHeaders) {
    for (const [key, val] of Object.entries(headers))
      if (val && key.startsWith('x-')) this.req.res.setHeader(key, val);
  }
}
