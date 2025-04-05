/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

if (process.env.NODE_ENV?.toLowerCase().startsWith('prod')) {
  if (process.env.ELASTIC_APM_SERVICE_NAME) require('elastic-apm-node').start();
  else throw Error('in production mode ELASTIC_APM_SERVICE_NAME is required.');
  require('tracing').init(['http']);
}

import { prototyping, setupSwagger } from '@app/common/core/utils';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/core';
import helmet from 'helmet';

prototyping();
import { AppModule } from './app.module';

const { GATEWAY } = APP;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(helmet({ contentSecurityPolicy: false }));

  setupSwagger(app);

  await app.listen(GATEWAY.API_PORT);

  const url = await app.getUrl();
  console.log(`Gateway Successfully Started On Port ${GATEWAY.API_PORT}`);
  console.log(`Swagger UI is running on: ${url}/api`);
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`OpenApi Spec is running on: ${url}/api-json`);
}
void bootstrap();
