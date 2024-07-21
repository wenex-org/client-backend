import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { date, getHeaders, getPath, getRequestInfo, logger, toJSON } from '@app/common/utils';
import { ProxyData, SyncData, SyncType } from '@app/common/interfaces';
import { toKebabCase } from 'naming-conventions-modeler';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { PROXY_SERVICE } from './proxy.const';

@Injectable({ scope: Scope.REQUEST })
export class ProxyService implements OnModuleInit {
  private readonly log = logger(ProxyService.name);

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
    } catch (err) {
      this.log.get(toKebabCase(this.beforeSync.name)).error(date('rabbitmq exception occurred with error %o'), err);

      if (typeof err?.message === 'string') {
        const error = toJSON(err.message);
        if (typeof error === 'object') {
          res.status(error.status ?? HttpStatus.INTERNAL_SERVER_ERROR);
          return { end: error };
        } else throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
      } else {
        if (err !== 'There is no matching message handler defined in the remote service.')
          throw new HttpException(err?.message ?? err, HttpStatus.BAD_GATEWAY);
      }
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
