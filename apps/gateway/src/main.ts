/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
require('log-node')();

import {
  NamingConventionsInterceptor,
  XRequestIdInterceptor,
} from '@app/common/interceptors';
import { setupSwagger } from '@app/common/utils';
import { NODE_ENV } from '@app/common/configs';
import { MACHINE } from '@app/common/helpers';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/consts';
import { initTracing } from 'tracing';
import helmet from 'helmet';

import { AppModule } from './app.module';

const { GATEWAY } = APP;

async function bootstrap() {
  if (NODE_ENV().IS_PROD) await initTracing(['http', 'amqp']);

  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(helmet({ contentSecurityPolicy: false }));

  app.useGlobalInterceptors(
    new XRequestIdInterceptor(),
    new NamingConventionsInterceptor(),
  );

  setupSwagger(app);

  await app.listen(GATEWAY.API_PORT);

  const url = await app.getUrl();
  console.log(`Gateway Successfully Started On Port ${GATEWAY.API_PORT}`);
  console.log(`Swagger UI is running on: ${url}/api`);
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`OpenApi Spec is running on: ${url}/api-json`);
  console.log('\x1b[32m%s\x1b[0m', 'Machine GUID:', MACHINE.GUID);
}
bootstrap();
