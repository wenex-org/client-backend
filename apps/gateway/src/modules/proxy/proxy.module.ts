import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

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
        name: 'PROXY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          consumer: { groupId: 'proxy-consumer' },
          client: { clientId: 'proxy', brokers: ['localhost:9092'] },
        },
      },
    ]),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
