import { Body, Controller, Put, UseInterceptors } from '@nestjs/common';
import { LoggerInterceptor } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { MirrorPayloadDto } from '@app/common/dto';

import { MirrorService } from './mirror.service';

@Controller()
@UseInterceptors(LoggerInterceptor, new SentryInterceptor())
export class MirrorController {
  constructor(readonly service: MirrorService) {}

  @Put('mirror')
  mirror(@Body() payload: MirrorPayloadDto) {
    this.service.mirror(payload);
  }
}
