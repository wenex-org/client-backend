import { All, Controller, HttpStatus, Req, Res, UseFilters, UseInterceptors } from '@nestjs/common';
import { LoggerInterceptor } from '@app/common/core/interceptors';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { setHeaders } from '@app/common/core/utils';
import { AxiosResponseHeaders } from 'axios';
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
      if (headers?.['etag'] && req.header('if-none-match') === headers['etag']) {
        res.status(HttpStatus.NOT_MODIFIED).end();
      } else {
        res.status(status ?? HttpStatus.INTERNAL_SERVER_ERROR);
        setHeaders(res, headers as AxiosResponseHeaders);
        if (data) data.pipe(res);
      }
    } else res.end();
  }
}
