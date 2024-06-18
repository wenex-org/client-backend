import { Headers, PreMail, SyncEnd } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { Mail } from '@wenex/sdk/common';
import { SdkService } from '@app/sdk';
import { readFileSync } from 'fs';
import hbs from 'handlebars';
import { join } from 'path';

@Injectable()
export class MailsService {
  constructor(private readonly sdkService: SdkService) {}

  async send(data: PreMail, headers?: Headers): Promise<SyncEnd<Mail>> {
    const { touch } = this.sdkService.client();

    const { template, options, context } = data;
    const path = `modules/mails/hbs/${template}.hbs`;
    const file = readFileSync(join(__dirname, path));
    const plate = hbs.compile(file.toString('utf8'), { noEscape: true });

    const html = plate(context);
    return touch.mails.send({ ...options, html }, { headers });
  }
}
