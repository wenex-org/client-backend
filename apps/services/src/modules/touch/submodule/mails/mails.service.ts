import { Headers, Serializer } from '@wenex/sdk/common/core/interfaces';
import { Email } from '@wenex/sdk/common/interfaces/touch';
import { toKebabCase } from 'naming-conventions-modeler';
import { SyncEnd } from '@app/common/core/interfaces';
import { contextGen } from '@app/common/utils/touch';
import { Mail } from '@app/common/interfaces/touch';
import { SdkService } from '@app/module/sdk';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import hbs from 'handlebars';
import { join } from 'path';

@Injectable()
export class MailsService {
  constructor(private readonly sdkService: SdkService) {}

  get emails() {
    return this.sdkService.client.touch.emails;
  }

  send(data: Mail, headers?: Headers): Promise<SyncEnd<Serializer<Email>>> {
    const { touch } = this.sdkService.client;
    const { template, options, context } = data;
    const path = `modules/touch/submodule/mails/hbs/${toKebabCase(template)}.hbs`;
    const file = readFileSync(join(__dirname, path));
    const plate = hbs.compile(file.toString('utf8'), { noEscape: true });
    const html = plate(contextGen(template, context ?? {}));
    return touch.emails.send({ ...options, html }, { headers });
  }
}
