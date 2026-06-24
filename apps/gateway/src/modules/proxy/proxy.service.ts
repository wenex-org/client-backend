import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { getHeaders, getPath, getRequestInfo, getXHeaders } from '@app/common/core/utils';
import { ProxyData, SyncData, SyncType } from '@app/common/core/interfaces';
import { logger, toJSON, toString } from '@wenex/sdk/common/core/utils';
import { NATS_GATEWAY } from '@app/common/core/constants';
import { ENV } from '@wenex/sdk/common/core/env.util';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class ProxyService implements OnModuleInit {
  private readonly log = logger(ProxyService.name);

  constructor(
    protected readonly http: HttpService,

    @Inject(REQUEST) private readonly req: Request,
    @Inject(NATS_GATEWAY) private readonly client: ClientProxy,
  ) {}

  onModuleInit() {
    return this.client.connect();
  }

  async afterSync(res: Response, data: AxiosResponse): Promise<AxiosResponse | undefined> {
    try {
      const { params, pattern } = getRequestInfo(this.req, 'after');

      const headers = Object.assign(getXHeaders(data.headers), getHeaders(this.req));
      const result = await lastValueFrom<SyncData>(
        this.client.send(pattern, {
          ip: this.req.ip,
          params,
          headers,
          data: data.data,
          query: this.req.query,
          method: this.req.method,
          url: this.req.originalUrl,
        } as ProxyData),
      );

      return this.mergeResponse(data, result);
    } catch (err) {
      if (typeof err.message === 'string') {
        this.log.extend(this.beforeSync.name)('exception occurred with error message %s', err.message);
        if (err.message.startsWith('Empty response. There are no subscribers listening to that message')) return data;
      }

      this.log.extend(this.beforeSync.name)('exception occurred with error %o', err);
      res.status(toJSON(err.message ?? '{}').status ?? HttpStatus.INTERNAL_SERVER_ERROR);
      throw new HttpException(toString(err.message ?? err), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async beforeSync(res: Response): Promise<SyncData> {
    try {
      const { params, pattern } = getRequestInfo(this.req, 'before');

      const result = await lastValueFrom<SyncData>(
        this.client.send(pattern, {
          ip: this.req.ip,
          params,
          query: this.req.query,
          method: this.req.method,
          url: this.req.originalUrl,
          data: this.req.body,
          headers: getHeaders(this.req),
        } as ProxyData),
      );

      return this.mergeRequest(result);
    } catch (err) {
      if (typeof err.message === 'string') {
        this.log.extend(this.beforeSync.name)('exception occurred with error message %s', err.message);
        if (err.message.startsWith('Empty response. There are no subscribers listening to that message')) return {};
      }

      this.log.extend(this.beforeSync.name)('exception occurred with error %o', err);
      res.status(toJSON(err.message ?? '{}').status ?? HttpStatus.INTERNAL_SERVER_ERROR);
      throw new HttpException(toString(err.message ?? err), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async all(res: Response): Promise<AxiosResponse | undefined> {
    const path = getPath(this.req);

    if (path.startsWith('/graphql') && this.req.body?.mutation && !ENV('GRAPHQL_MUTATION_SUPPORT')) {
      throw new HttpException('GraphQL mutations are not allowed', HttpStatus.METHOD_NOT_ALLOWED);
    }

    const before = await this.beforeSync(res);

    if (!before?.end) {
      this.log.extend(this.all.name)('path %s', path);
      if (/upload/.test(path)) {
        // Stream the raw multipart request straight through to the platform in a
        // single pass: pipe `this.req` as the request body instead of buffering the
        // file to disk and re-uploading it. `getHeaders` already forwards the original
        // `content-type` (with the multipart boundary); forward `content-length` too so
        // the platform gets a real length (falls back to chunked encoding if absent).
        const headers = getHeaders(this.req);
        const contentLength = this.req.header('content-length');
        if (contentLength) headers['content-length'] = contentLength;

        const result = await this.http.axiosRef.request({
          responseType: 'json',
          url: path,
          data: this.req,
          params: this.req.query,
          method: this.req.method,
          headers,
          baseURL: process.env.PLATFORM_URL,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        });
        return this.afterSync(res, result as any);
      } else if (/(cursor|download)/.test(path)) {
        return this.http.axiosRef.request({
          responseType: 'stream',
          url: path,
          data: this.req.body,
          params: this.req.query,
          method: this.req.method,
          headers: getHeaders(this.req),
          baseURL: process.env.PLATFORM_URL,
        });
      } else {
        const result = await this.http.axiosRef.request({
          responseType: 'json',
          url: path,
          data: this.req.body,
          params: this.req.query,
          method: this.req.method,
          headers: getHeaders(this.req),
          baseURL: process.env.PLATFORM_URL,
        });
        return this.afterSync(res, result as any);
      }
    } else res.json(before.end);
  }

  private mergeResponse(data: AxiosResponse, syncData: SyncData): AxiosResponse {
    const merge = (key: keyof Pick<SyncData, 'body' | 'query' | 'headers'>, type: SyncType) => {
      if (syncData[key]?.data) {
        if (type === 'assign') Object.assign(data[key === 'body' ? 'data' : 'headers'], syncData[key].data);
        else if (type === 'replace') data[key === 'body' ? 'data' : 'headers'] = syncData[key].data;
      }
    };

    if (syncData?.body) merge('body', syncData.body.type);
    if (syncData?.query) merge('query', syncData.query.type);
    if (syncData?.headers) merge('headers', syncData.headers.type);

    return data;
  }

  private mergeRequest(syncData: SyncData): SyncData {
    const merge = (key: keyof Pick<SyncData, 'body' | 'query' | 'headers'>, type: SyncType) => {
      if (syncData[key]?.data) {
        if (type === 'assign') Object.assign(this.req[key], syncData[key].data);
        else if (type === 'replace') this.req[key] = syncData[key].data;
      }
    };

    if (syncData?.body) merge('body', syncData.body.type);
    if (syncData?.query) merge('query', syncData.query.type);
    if (syncData?.headers) merge('headers', syncData.headers.type);

    return syncData;
  }
}
