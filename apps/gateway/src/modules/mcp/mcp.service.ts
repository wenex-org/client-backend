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

    // `getHeaders` only carries `x-*` + a fixed allowlist, so non-`x-` headers
    // the MCP streamable transport needs must be bridged explicitly. The
    // platform `StreamableHTTPServerTransport` rejects (406 Not Acceptable)
    // requests whose `Accept` header lacks `application/json`/`text/event-stream`,
    // so `accept` must cross the proxy alongside `mcp-session-id`.
    const sessionId = this.req.header('mcp-session-id');
    if (sessionId) headers['mcp-session-id'] = sessionId;

    const accept = this.req.header('accept');
    if (accept) headers['accept'] = accept;

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
      // Forward upstream status verbatim (incl. error codes) instead of letting
      // axios reject ≥400 into a generic Nest 500 that masks the real cause.
      validateStatus: () => true,
    });
  }
}
