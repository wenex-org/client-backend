import { Module } from '@nestjs/common';

import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';

@Module({
  controllers: [MailsController],
  providers: [MailsService],
})
export class MailsModule {}
