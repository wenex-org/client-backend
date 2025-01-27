import { Headers } from '@wenex/sdk/common/core/interfaces';
import { toKebabCase } from 'naming-conventions-modeler';
import { SyncEnd } from '@app/common/core/interfaces';
import { Mail } from '@app/common/interfaces/touch';
import { SdkService } from '@app/module/sdk';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import hbs from 'handlebars';
import { join } from 'path';

@Injectable()
export class MailsService {
  constructor(private readonly sdkService: SdkService) {}

  send(data: Mail, headers?: Headers): Promise<SyncEnd> {
    const { touch } = this.sdkService.client;
    const { template, options, context } = data;
    const path = `modules/touch/submodule/mails/hbs/${toKebabCase(template)}.hbs`;
    const file = readFileSync(join(__dirname, path));
    const plate = hbs.compile(file.toString('utf8'), { noEscape: true });
    const html = plate(context);
    return touch.emails.send({ ...options, html }, { headers });
  }
}
