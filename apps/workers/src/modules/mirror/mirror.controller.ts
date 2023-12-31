import { LoggerInterceptor, ParseInterceptor } from '@app/common/interceptors';
import { Body, Controller, Put, UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { MirrorPayloadDto } from '@app/common/dto';

import { MirrorService } from './mirror.service';

@UseInterceptors(LoggerInterceptor, ParseInterceptor, new SentryInterceptor())
@Controller()
export class MirrorController {
  constructor(readonly service: MirrorService) {}

  /**
   * To use db mirror functionality create a webhook on the platform EMQX with
   * topic '6448d4122ed1fc913e4d4a5a/mongo/+/cdc', method 'PUT' and
   * url 'http://localhost:8002/mirror'
   *
   * @param payload
   */
  @Put('mirror')
  mirror(@Body('payload') payload: MirrorPayloadDto) {
    this.service.mirror(payload);
  }
}
