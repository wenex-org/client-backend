import { Injectable } from '@nestjs/common';

import { MailsService } from './submodule/mails';

@Injectable()
export class TouchService {
  constructor(readonly mails: MailsService) {}
}
