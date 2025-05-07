/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

if (process.env.NODE_ENV?.toLowerCase().startsWith('prod')) {
  require('tracing').init(['http']);
}

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Machine } from '@wenex/sdk/common/core/helpers';
import { prototyping } from '@app/common/core/utils';
import { NATS_CONFIG } from '@app/common/core/envs';
import { NestFactory } from '@nestjs/core';
import { APP } from '@app/common/core';

prototyping('SERVICES');
import { AppModule } from './app.module';

const { SERVICES } = APP;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: NATS_CONFIG(),
  });

  await app.startAllMicroservices();
  await app.listen(SERVICES.API_PORT, '0.0.0.0');

  const url = await app.getUrl();
  console.log(`Prometheus is running on ${url}/metrics`);
  console.log(`Health check is running on ${url}/status`);
  console.log(`Services NATS Micro Successfully Started`);
  console.log('\x1b[32m%s\x1b[0m', 'MachineID:', Machine.STATIC_ID);
}
void bootstrap();
