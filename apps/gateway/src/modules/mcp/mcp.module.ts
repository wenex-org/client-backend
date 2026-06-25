import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { McpService } from './mcp.service';
import { McpController } from './mcp.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 0,
      baseURL: process.env.PLATFORM_URL,
      headers: { 'x-api-key': process.env.API_KEY },
    }),
  ],
  controllers: [McpController],
  providers: [McpService],
})
export class McpModule {}
