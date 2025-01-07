import { Module } from '@nestjs/common';

import { CqrsService } from './cqrs.service';
import { CqrsController } from './cqrs.controller';

@Module({
  controllers: [CqrsController],
  providers: [CqrsService],
})
export class CqrsModule {}
