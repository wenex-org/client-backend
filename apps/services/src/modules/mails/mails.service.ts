import { Headers, PreMail, SyncEnd } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { Mail } from '@wenex/sdk/common';
import { SdkService } from '@app/sdk';
import Handlebars from 'handlebars';

@Injectable()
export class MailsService {
  constructor(private readonly sdkService: SdkService) {}

  async send(data: PreMail, headers?: Headers): Promise<SyncEnd<Mail>> {
    const { touch } = this.sdkService.client();

    const { template, options, context } = data;
    const plate = Handlebars.compile(`./hbs/${template}.hbs`);

    const html = plate(context);
    return touch.mails.send({ ...options, html }, { headers });
  }
}
