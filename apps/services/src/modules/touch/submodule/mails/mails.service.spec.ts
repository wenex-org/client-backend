import { PLATFORM_CONFIG } from '@app/common/core/envs';
import { Test, TestingModule } from '@nestjs/testing';
import { SdkModule } from '@app/module/sdk';

import { MailsModule } from './mails.module';
import { MailsService } from './mails.service';

describe('MailsService', () => {
  let service: MailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SdkModule.forRoot(PLATFORM_CONFIG()), MailsModule],
    }).compile();

    service = module.get<MailsService>(MailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
