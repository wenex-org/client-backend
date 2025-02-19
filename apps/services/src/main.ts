/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NATS_CONFIG, NODE_ENV } from '@app/common/core/envs';
import { Machine } from '@wenex/sdk/common/core/helpers';
import { prototyping } from '@app/common/core/utils';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/core';
import { initTracing } from 'tracing';

prototyping('SERVICES');
import { AppModule } from './app.module';

const { SERVICES } = APP;
async function bootstrap() {
  if (NODE_ENV().IS_PROD) initTracing(['http']);

  const app = await NestFactory.create(AppModule, { cors: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: NATS_CONFIG(),
  });

  await app.startAllMicroservices();
  await app.listen(SERVICES.API_PORT);

  const url = await app.getUrl();
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`Services NATS Micro Successfully Started`);
  console.log('\x1b[32m%s\x1b[0m', 'MachineID:', Machine.STATIC_ID);
}
void bootstrap();
