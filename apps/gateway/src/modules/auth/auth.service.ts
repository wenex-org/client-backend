import {
  AuthenticationRequest,
  AuthorizationCanRequest,
  AuthorizationPolicyRequest,
  Token,
} from '@wenex/sdk/common';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AxiosPromise } from 'axios';
import { Request } from 'express';
import { of } from 'rxjs';

import { AuthProvider } from './auth.provider';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private readonly provider: AuthProvider,
    @Inject(REQUEST) private readonly req: Request,
  ) {}

  async token(data: AuthenticationRequest) {
    data.app_id = process.env.APP_ID;
    data.client_id = process.env.CLIENT_ID;
    data.client_secret = process.env.CLIENT_SECRET;

    const res = this.provider.client.authentication.token(data, {
      headers: this.headers(),
    });

    return await this.response(res);
  }

  async verify(data: Token) {
    const res = this.provider.client.authentication.verify(data, {
      headers: this.headers(),
    });

    return await this.response(res);
  }

  async logout(data: Token) {
    const res = this.provider.client.authentication.logout(data, {
      headers: this.headers(),
    });

    return await this.response(res);
  }

  async can(data: AuthorizationCanRequest) {
    const res = this.provider.client.authorization.can(data, {
      headers: this.headers(),
    });

    return await this.response(res);
  }

  async policy(data: AuthorizationPolicyRequest) {
    const res = this.provider.client.authorization.policy(data, {
      headers: this.headers(),
    });

    return await this.response(res);
  }

  protected headers() {
    const xUserIP = this.req.ip;
    const xUserAgent = this.req.headers['user-agent'];
    const authorization = this.req.headers['authorization'];

    return {
      'x-user-ip': xUserIP,
      'x-user-agent': xUserAgent,
      authorization: authorization,
    };
  }

  protected async response(res: AxiosPromise) {
    const send = (data: any, status: number, headers: Record<string, string>) => {
      this.req.res.status(status);

      for (const [key, val] of Object.entries(headers))
        if (key.startsWith('x-')) this.req.res.setHeader(key, val);

      return of(data);
    };

    try {
      const { data, status, headers } = await res;
      return send(data, status, headers as Record<string, string>);
    } catch ({ response }) {
      const { data, status, headers } = response;
      return send(data, status, headers as Record<string, string>);
    }
  }
}
