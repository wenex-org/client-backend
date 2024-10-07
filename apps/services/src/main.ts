/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
require('log-node')();

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NODE_ENV, RMQ_CONFIG } from '@app/common/envs';
import { prototyping } from '@app/common/utils';
import { MACHINE } from '@app/common/helpers';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/consts';
import { initTracing } from 'tracing';

import { AppModule } from './app.module';

const { SERVICE } = APP;

prototyping();
async function bootstrap() {
  if (NODE_ENV().IS_PROD) await initTracing(['http', 'amqp']);

  const app = await NestFactory.create(AppModule, { cors: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: RMQ_CONFIG(),
  });

  await app.startAllMicroservices();
  await app.listen(SERVICE.API_PORT);

  const url = await app.getUrl();
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`Service RMQ Micro Successfully Started`);
  console.log('\x1b[32m%s\x1b[0m', 'MachineID:', MACHINE.ID);
}
bootstrap();
