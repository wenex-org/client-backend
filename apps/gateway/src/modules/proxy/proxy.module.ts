import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQ_CONFIG } from '@app/common/configs';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PROXY_SERVICE } from './proxy.const';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.PLATFORM_URL,
      timeout: +(process.env.TIMEOUT || 30000),
      headers: { 'api-key': process.env.API_KEY },
    }),
    ClientsModule.register([
      {
        name: PROXY_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [RMQ_CONFIG()],
          queueOptions: { durable: false },
          queue: process.env.ENGAGE_QUEUE ?? 'proxy',
        },
      },
    ]),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
