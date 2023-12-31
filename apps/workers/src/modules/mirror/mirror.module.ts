import { Module } from '@nestjs/common';

import { MirrorService } from './mirror.service';
import { MirrorController } from './mirror.controller';

@Module({
  controllers: [MirrorController],
  providers: [MirrorService],
})
export class MirrorModule {}
