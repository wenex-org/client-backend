import { All, Controller, Res, UseFilters, UseInterceptors } from '@nestjs/common';
import { LoggerInterceptor } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ProxyService } from './proxy.service';

@Controller()
@ApiBearerAuth()
@ApiTags('proxy')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async all(@Res() res: Response) {
    const { data, status, headers } = await this.proxyService.all();

    res.status(status);
    for (const head in headers)
      if (headers[head]?.startsWith('x-')) res.setHeader(head, headers[head]);
    data.pipe(res);
  }
}
