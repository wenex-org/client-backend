import {
  All,
  Controller,
  HttpStatus,
  Req,
  Res,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { LoggerInterceptor } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ProxyService } from './proxy.service';

@Controller()
@ApiBearerAuth()
@ApiTags('proxy')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async all(@Req() req: Request, @Res() res: Response) {
    const { data, status, headers } = (await this.proxyService.all(res)) ?? {};

    if (data || status || headers) {
      if (req.header('if-none-match') === headers?.['etag']) {
        res.status(HttpStatus.NOT_MODIFIED).end();
      } else {
        res.status(status ?? 500);
        for (const head in headers ?? {}) {
          if (head?.startsWith('x-') || head?.includes('etag'))
            res.setHeader(head, headers[head]);
        }
        if (data) data.pipe(res);
      }
    } else res.end();
  }
}
