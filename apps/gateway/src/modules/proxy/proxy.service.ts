import { Inject, Injectable, Scope } from '@nestjs/common';
import { getHeaders } from '@app/common/utils';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { AxiosResponse } from 'axios';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly req: Request,
  ) {}

  async all(): Promise<AxiosResponse> {
    try {
      return await this.httpService.axiosRef.request({
        responseType: 'stream',

        data: this.req.body,
        params: this.req.params,
        method: this.req.method,
        url: this.req.originalUrl,
        headers: getHeaders(this.req),
        baseURL: process.env.PLATFORM_URL,
      });
    } catch ({ response }) {
      return response;
    }
  }
}
