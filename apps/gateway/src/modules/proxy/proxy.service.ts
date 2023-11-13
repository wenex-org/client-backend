import { Inject, Injectable, Scope } from '@nestjs/common';
import type { AxiosError, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly req: Request,
  ) {}

  async all(): { data: any; status: number; headers: Record<string, string> } {
    const xUserIP = this.req.ip;
    const xForward = this.req.headers['x-forward'];
    const xUserAgent = this.req.headers['user-agent'];
    const authorization = this.req.headers['authorization'];

    const reqHeaders = {
      'x-user-ip': xUserIP,
      'x-user-agent': xUserAgent,
      authorization: authorization,
    };

    // Issue: bug about unwanted query string
    if (this.req.params['0']) delete this.req.params['0'];

    const response = ({ data, headers, status }: AxiosResponse) => {
      this.req.res.status(status);

      for (const [key, val] of Object.entries(headers))
        if (key.startsWith('x-')) this.req.res.setHeader(key, val as string);

      return data;
    };

    try {
      return response(
        await this.httpService.axiosRef.request({
          data: this.req.body,
          params: this.req.params,
          method: this.req.method,
          url: this.req.originalUrl,
          headers: reqHeaders,
          baseURL: xForward?.includes('client')
            ? process.env.CLIENT_CRAFTS_URL
            : process.env.PLATFORM_URL,
          responseType: 'stream',
        }),
      );
    } catch (error) {
      return response((error as AxiosError).response);
    }
  }
}
