import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';
import * as crypto from 'crypto';

import { date, getRequest, logger, set } from '../utils';

@Injectable()
export class XRequestIdInterceptor implements NestInterceptor {
  private readonly log = logger(XRequestIdInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = getRequest<{ res: any; headers: Record<string, string> }>(context);

    const xRequestId = req.headers['x-request-id'] || crypto.randomUUID();

    this.log
      .get(this.intercept.name)
      .info(date(`request received with request id: ${xRequestId}`));

    set(req.headers, 'x-request-id', xRequestId);
    req.res.setHeader('x-request-id', xRequestId);

    return next.handle();
  }
}
