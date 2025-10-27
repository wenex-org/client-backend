import { PLATFORM_CONFIG } from '@app/common/core/envs';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';

@Module({
  imports: [HttpModule.register(PLATFORM_CONFIG())],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
