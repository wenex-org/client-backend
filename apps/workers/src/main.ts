/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

import { initTracing } from 'tracing';
import { prototyping, setupSwagger } from '@app/common/core/utils';
import { NODE_ENV } from '@app/common/core/envs';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/core';
import helmet from 'helmet';

prototyping('WORKERS');
import { AppModule } from './app.module';

const { WORKERS } = APP;
async function bootstrap() {
  if (NODE_ENV().IS_PROD) {
    initTracing(['http']);
    require('elastic-apm-node').start();
  }

  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(helmet({ contentSecurityPolicy: false }));

  setupSwagger(app);

  await app.listen(WORKERS.API_PORT);

  const url = await app.getUrl();
  console.log(`Swagger UI is running on: ${url}/api`);
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`OpenApi Spec is running on: ${url}/api-json`);
  console.log(`Workers Micro Successfully Started`);
}
void bootstrap();
