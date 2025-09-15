import { All, Controller, HttpStatus, Req, Res, UseFilters, UseInterceptors } from '@nestjs/common';
import { LoggerInterceptor } from '@app/common/core/interceptors';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { assertion, setHeaders } from '@app/common/core/utils';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { isAlive } from '@wenex/sdk/common/core/utils';
import { AxiosResponseHeaders } from 'axios';
import { Request, Response } from 'express';
import { APP } from '@app/common';

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
    const serviceUrl = `http://${APP.SERVICES.HOST}:${APP.SERVICES.API_PORT}`;
    assertion(await isAlive(serviceUrl), 'Service is not alive', HttpStatus.SERVICE_UNAVAILABLE);

    const { data, status, headers, config } = (await this.proxyService.all(res)) ?? {};
    if (data || status || headers) {
      if (headers?.['etag'] && req.header('if-none-match') === headers['etag']) {
        res.status(HttpStatus.NOT_MODIFIED).end();
      } else {
        res.status(status ?? HttpStatus.INTERNAL_SERVER_ERROR);
        setHeaders(res, headers as AxiosResponseHeaders);
        if (data && config?.responseType === 'stream') data.pipe(res);
        else if (data && config?.responseType === 'json') res.send(data);
      }
    } else res.end();
  }
}
