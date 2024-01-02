import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
  Scope,
} from '@nestjs/common';
import { getHeaders, getPath, getRequestInfo, toJSON } from '@app/common/utils';
import { ProxyData, SyncData, SyncType } from '@app/common/interfaces';
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

  async beforeSync(res: Response): Promise<SyncData> {
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
    } catch ({ message }) {
      if (typeof message === 'string') {
        const error = toJSON(message);
        if (typeof error === 'object') {
          res.status(error.status ?? HttpStatus.INTERNAL_SERVER_ERROR);
          return { end: error };
        }
      } else throw new HttpException('timeout exceeded', HttpStatus.GATEWAY_TIMEOUT);
    }
  }

  async all(res: Response): Promise<AxiosResponse> {
    const before = await this.beforeSync(res);

    try {
      if (!before?.end) {
        return await this.httpService.axiosRef.request({
          responseType: 'stream',

          data: this.req.body,
          url: getPath(this.req),
          params: this.req.query,
          method: this.req.method,
          headers: getHeaders(this.req),
          baseURL: process.env.PLATFORM_URL,
        });
      } else res.json(before.end);
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
