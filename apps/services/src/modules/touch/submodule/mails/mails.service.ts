import { Headers, Serializer } from '@wenex/sdk/common/core/interfaces';
import { Email } from '@wenex/sdk/common/interfaces/touch';
import { toKebabCase } from 'naming-conventions-modeler';
import { clientConfig } from '@app/common/core/utils';
import { SyncEnd } from '@app/common/core/interfaces';
import { contextGen } from '@app/common/utils/touch';
import { Mail } from '@app/common/interfaces/touch';
import { get } from '@wenex/sdk/common/core/utils';
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

  async send(data: Mail, headers?: Headers): Promise<SyncEnd<Serializer<Email>>> {
    const { template, options, context } = data;
    const templateName = toKebabCase(template);
    const templatesDir = join(__dirname, 'modules/touch/submodules/mails/hbs');
    const templatePath = join(templatesDir, get('x-lang', headers, 'en'), `${templateName}.hbs`);
    const html = hbs.compile(readFileSync(templatePath, 'utf8'), { noEscape: true })(contextGen(template, context ?? {}));
    return this.emails.send({ ...options, html }, clientConfig(headers));
  }
}
