import { Headers } from '@wenex/sdk/common/core/interfaces';
import { toKebabCase } from 'naming-conventions-modeler';
import { SyncEnd } from '@app/common/core/interfaces';
import { contextGen } from '@app/common/utils/touch';
import { Mail } from '@app/common/interfaces/touch';
import { mask } from '@wenex/sdk/common/core/utils';
import { SdkService } from '@app/module/sdk';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import hbs from 'handlebars';
import { join } from 'path';

@Injectable()
export class MailsService {
  constructor(private readonly sdkService: SdkService) {}

  async send(data: Mail, headers?: Headers): Promise<SyncEnd> {
    const { touch } = this.sdkService.client;
    const { template, options, context } = data;
    const path = `modules/touch/submodule/mails/hbs/${toKebabCase(template)}.hbs`;
    const file = readFileSync(join(__dirname, path));
    const plate = hbs.compile(file.toString('utf8'), { noEscape: true });
    const html = plate(contextGen(template, context ?? {}));
    options.props = { ...options.props, context: mask([context])[0] };
    const result = await touch.emails.send({ ...options, html }, { headers });

    // TODO

    return touch.emails.updateById(result.id, { html: html.replace(/\d+/g, '*') }, { headers });
  }
}
