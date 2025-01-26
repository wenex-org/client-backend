import { Module } from '@nestjs/common';

import { TouchService } from './touch.service';
import { MailsModule } from './submodule/mails';

@Module({
  imports: [MailsModule],
  providers: [TouchService],
  exports: [TouchService],
})
export class TouchModule {}
