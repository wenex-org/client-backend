import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { getHeaders, getPath, getRequestInfo } from '@app/common/core/utils';
import { ProxyData, SyncData, SyncType } from '@app/common/core/interfaces';
import { logger, toJSON, toString } from '@wenex/sdk/common/core/utils';
import { ClientProxy } from '@nestjs/microservices';
import formidable, { File } from 'formidable';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import fs from 'fs/promises';

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

  async afterSync(res: Response, data: AxiosResponse): Promise<AxiosResponse | undefined> {
    try {
      const { params, pattern } = getRequestInfo(this.req, 'after');

      const result = await lastValueFrom<SyncData>(
        this.client.send(pattern, {
          params,
          data: data.data,
          query: this.req.query,
          method: this.req.method,
          url: this.req.originalUrl,
          headers: getHeaders(this.req),
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

  async beforeSync(res: Response, files?: File[]): Promise<SyncData> {
    try {
      const { params, pattern } = getRequestInfo(this.req, 'before');

      const result = await lastValueFrom<SyncData>(
        this.client.send(pattern, {
          params,
          query: this.req.query,
          method: this.req.method,
          url: this.req.originalUrl,
          data: files || this.req.body,
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

    let before: SyncData;
    const formData = new FormData();
    if (/upload/.test(path)) {
      const form = formidable({ multiples: true, uploadDir: '.data', keepExtensions: false });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, files] = await form.parse(this.req);
      for (const file of files.file ?? []) {
        const buffer = Buffer.from(await fs.readFile(file.filepath));
        formData.append('file', new Blob([buffer]), file.originalFilename!);
        await fs.unlink(file.filepath); // delete the file after reading
        this.log.extend(this.all.name)('file %s processid', file.filepath);
      }
      before = await this.beforeSync(res, files.file);
    } else before = await this.beforeSync(res);

    if (!before?.end) {
      this.log.extend(this.all.name)('path %s', path);
      if (/upload/.test(path)) {
        const result = await this.http.axiosRef.request({
          responseType: 'json',
          url: path,
          data: formData,
          params: this.req.query,
          method: this.req.method,
          headers: {
            'x-user-ip': this.req.ip,
            'x-api-key': process.env.API_KEY,
            'Content-Type': 'multipart/form-data',
            'x-user-agent': this.req.header('user-agent'),
            Authorization: this.req.header('authorization'),
          },
          baseURL: process.env.PLATFORM_URL,
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
