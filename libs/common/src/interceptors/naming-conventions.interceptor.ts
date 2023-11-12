import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Modeler, NamingConvention } from 'naming-conventions-modeler';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { isObject } from 'class-validator';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { date, get, logger, set } from '../utils';

@Injectable()
export class NamingConventionsInterceptor implements NestInterceptor {
  private readonly log = logger(NamingConventionsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType<GqlContextType>();

    switch (type) {
      case 'graphql': {
        const { req } = GqlExecutionContext.create(context).getContext();
        set(req.headers, 'x-naming-convention', 'snake_case');
        return next.handle();
      }
      case 'http': {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();

        let conventionName = get<NamingConvention>(req.headers, 'x-naming-convention');

        if (conventionName?.toLowerCase().includes('snake')) {
          conventionName = 'snake_case';
        } else if (conventionName?.toLowerCase().includes('camel')) {
          conventionName = 'camelCase';
        } else conventionName = undefined;

        this.log
          .get(this.intercept.name)
          .info(date(`naming convention header is ${conventionName ?? 'snake_case'}`));

        res.setHeader('x-naming-convention', conventionName ?? 'snake_case');
        set(req.headers, 'x-naming-convention', conventionName ?? 'snake_case');

        if (req.body) req.body = Modeler.build(req.body, 'snake_case');

        return next
          .handle()
          .pipe(
            map((data) =>
              conventionName && isObject(data)
                ? Modeler.build(data, conventionName ?? 'snake_case')
                : data,
            ),
          );
      }
      default:
        throw new Error('Unknown naming conventions interceptor context type');
    }
  }
}
