import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_CONFIG } from '@app/common/core/envs';
import { Module } from '@nestjs/common';

import { CqrsService } from './cqrs.service';
import { CQRS_GATEWAY } from './cqrs.constant';
import { CqrsController } from './cqrs.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CQRS_GATEWAY,
        options: NATS_CONFIG(),
        transport: Transport.NATS,
      },
    ]),
  ],
  controllers: [CqrsController],
  providers: [CqrsService],
})
export class CqrsModule {}
