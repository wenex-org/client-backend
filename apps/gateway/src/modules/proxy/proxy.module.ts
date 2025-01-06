import { NATS_CONFIG, PLATFORM_CONFIG } from '@app/common/core/envs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PROXY_GATEWAY } from './proxy.const';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PROXY_GATEWAY,
        options: NATS_CONFIG(),
        transport: Transport.NATS,
      },
    ]),
    HttpModule.register(PLATFORM_CONFIG()),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
