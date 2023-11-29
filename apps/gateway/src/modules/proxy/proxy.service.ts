import { Inject, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { getHeaders } from '@app/common/utils';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { AxiosResponse } from 'axios';

import { PROXY_SERVICE } from './proxy.const';

@Injectable({ scope: Scope.REQUEST })
export class ProxyService implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,

    @Inject(REQUEST) private readonly req: Request,
    @Inject(PROXY_SERVICE) private readonly client: ClientProxy,
  ) {}

  onModuleInit() {
    this.client.connect();
  }

  async all(_res?: Response): Promise<AxiosResponse> {
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
