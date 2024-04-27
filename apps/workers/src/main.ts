/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
require('log-node')();

import { setupSwagger } from '@app/common/utils';
import { NODE_ENV } from '@app/common/configs';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/consts';
import { initTracing } from 'tracing';

import { AppModule } from './app.module';

const { WORKER } = APP;

async function bootstrap() {
  if (NODE_ENV().IS_PROD) {
    await initTracing(['http']);
    require('elastic-apm-node').start();
  }

  const app = await NestFactory.create(AppModule, { cors: true });

  setupSwagger(app);

  await app.listen(WORKER.API_PORT);

  const url = await app.getUrl();
  console.log(`Swagger UI is running on: ${url}/api`);
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`OpenApi Spec is running on: ${url}/api-json`);
  console.log(`Worker Micro Successfully Started`);
}
bootstrap();
