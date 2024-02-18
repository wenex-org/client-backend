import { Headers, SyncEnd } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { SdkService } from '@app/sdk';

@Injectable()
export class MailsService {
  constructor(private readonly sdkService: SdkService) {}

  async send(data: any, headers?: Headers): Promise<SyncEnd> {
    const { touch } = this.sdkService.client();

    console.log(data);

    return touch.mails.send(data, { headers });
  }
}
