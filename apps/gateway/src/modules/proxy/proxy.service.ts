import { Inject, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { ProxyData, SyncData, SyncType } from '@app/common/interfaces';
import { getHeaders, getRequestInfo } from '@app/common/utils';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

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

  async beforeSync(): Promise<SyncData> {
    try {
      const { params, pattern } = getRequestInfo(this.req, 'Before');

      const result = await lastValueFrom<SyncData>(
        this.client.send(pattern, {
          params,
          data: this.req.body,
          query: this.req.query,
          method: this.req.method,
          url: this.req.originalUrl,
          headers: getHeaders(this.req),
        } as ProxyData),
      );

      this.mergeRequest(result);
      return result;
    } catch {}
  }

  async all(res: Response): Promise<AxiosResponse> {
    const before = await this.beforeSync();

    try {
      if (!before?.end) {
        return await this.httpService.axiosRef.request({
          responseType: 'stream',

          data: this.req.body,
          params: this.req.query,
          method: this.req.method,
          url: this.req.originalUrl,
          headers: getHeaders(this.req),
          baseURL: process.env.PLATFORM_URL,
        });
      } else res.json(before?.end ?? before);
    } catch ({ response }) {
      return response;
    }
  }

  private mergeRequest(syncData?: SyncData) {
    const merge = (key: 'body' | 'query', type?: SyncType) => {
      if (!type) return;

      if (type === 'assign') Object.assign(this.req[key], syncData[key].data);
      else if (type === 'replace') this.req[key] = syncData[key].data;
    };

    if (syncData?.body) merge('body', syncData.body.type);
    if (syncData?.query) merge('query', syncData.query.type);
  }
}
