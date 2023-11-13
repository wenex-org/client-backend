import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: +(process.env.TIMEOUT || 30000),
      headers: { 'api-key': process.env.API_KEY },
    }),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
