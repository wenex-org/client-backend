import { Inject, Injectable, Scope } from '@nestjs/common';
import { getHeaders } from '@app/common/core/utils';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { AxiosResponse } from 'axios';

@Injectable({ scope: Scope.REQUEST })
export class McpService {
  constructor(
    protected readonly http: HttpService,

    @Inject(REQUEST) private readonly req: Request,
  ) {}

  async forward(): Promise<AxiosResponse> {
    const headers = getHeaders(this.req);

    const sessionId = this.req.header('mcp-session-id');
    if (sessionId) headers['mcp-session-id'] = sessionId;

    return this.http.axiosRef.request({
      url: '/mcp',
      data: this.req.body,
      headers,
      params: this.req.query,
      method: this.req.method,
      responseType: 'stream',
      timeout: 0,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      baseURL: process.env.PLATFORM_URL,
    });
  }
}
