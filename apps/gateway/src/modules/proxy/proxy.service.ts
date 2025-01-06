import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { getHeaders, getPath, getRequestInfo } from '@app/common/core/utils';
import { ProxyData, SyncData, SyncType } from '@app/common/core/interfaces';
import { logger, toJSON, toString } from '@wenex/sdk/common/core/utils';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { PROXY_GATEWAY } from './proxy.const';

@Injectable({ scope: Scope.REQUEST })
export class ProxyService implements OnModuleInit {
  private readonly log = logger(ProxyService.name);

  constructor(
    protected readonly http: HttpService,

    @Inject(REQUEST) private readonly req: Request,
    @Inject(PROXY_GATEWAY) private readonly client: ClientProxy,
  ) {}

  onModuleInit() {
    return this.client.connect();
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
    } catch (err) {
      this.log.extend(this.beforeSync.name)('exception occurred with error %o', err);
      res.status(toJSON(err.message ?? '{}').status ?? HttpStatus.INTERNAL_SERVER_ERROR);
      throw new HttpException(toString(err.message ?? err), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async all(res: Response): Promise<AxiosResponse | undefined> {
    const before = await this.beforeSync(res);

    if (!before?.end) {
      return await this.http.axiosRef.request({
        responseType: 'stream',
        data: this.req.body,
        url: getPath(this.req),
        params: this.req.query,
        method: this.req.method,
        headers: getHeaders(this.req),
        baseURL: process.env.PLATFORM_URL,
      });
    } else res.json(before.end);
  }

  private mergeRequest(syncData?: SyncData) {
    if (!syncData) return;

    const merge = (key: keyof Pick<SyncData, 'body' | 'query'>, type: SyncType) => {
      if (syncData[key]?.data) {
        if (type === 'assign') Object.assign(this.req[key], syncData[key].data);
        else if (type === 'replace') this.req[key] = syncData[key].data;
      }
    };

    if (syncData?.body) merge('body', syncData.body.type);
    if (syncData?.query) merge('query', syncData.query.type);
  }
}
