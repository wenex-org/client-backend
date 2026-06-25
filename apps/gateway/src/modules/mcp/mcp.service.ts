import { Inject, Injectable, Scope } from '@nestjs/common';
import { getHeaders } from '@app/common/core/utils';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { AxiosResponse } from 'axios';
import { Request } from 'express';

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
      responseType: 'stream',
      url: '/mcp',
      headers,
      timeout: 0,
      data: this.req.body,
      params: this.req.query,
      method: this.req.method,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      baseURL: process.env.PLATFORM_URL,
    });
  }
}
