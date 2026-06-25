import { Controller, Get, Post, Res } from '@nestjs/common';
import { setHeaders } from '@app/common/core/utils';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AxiosResponseHeaders } from 'axios';
import { Response } from 'express';

import { McpService } from './mcp.service';

@Controller('mcp')
@ApiBearerAuth()
@ApiTags('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get()
  async get(@Res() res: Response): Promise<void> {
    await this.stream(res);
  }

  @Post()
  async post(@Res() res: Response): Promise<void> {
    await this.stream(res);
  }

  private async stream(res: Response): Promise<void> {
    const { data, status, headers } = await this.mcpService.forward();

    res.status(status);
    setHeaders(res, headers as AxiosResponseHeaders);

    const sessionId = headers['mcp-session-id'];
    if (sessionId) res.setHeader('mcp-session-id', sessionId);

    data.on('error', () => res.destroy());
    res.on('close', () => data.destroy());
    data.pipe(res);
  }
}
