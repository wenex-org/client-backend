import { CLIENT_CONFIG, PLATFORM_CONFIG, REDIS_CONFIG } from '@app/common/core/envs';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RedisModule } from '@app/module/redis';
import { SdkModule } from '@app/module/sdk';

import { PublicModule } from './public.module';
import { PublicService } from './public.service';

describe('PublicService', () => {
  let app: INestApplication;
  let service: PublicService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RedisModule.forRoot(REDIS_CONFIG()), SdkModule.forRoot(PLATFORM_CONFIG()), PublicModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = app.get<PublicService>(PublicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('agent', async () => {
    const { APP_ID } = CLIENT_CONFIG();
    const result = await service.agent(APP_ID);
    expect(result).toStrictEqual({ app: expect.any(Object), client: expect.any(Object) });
  });
});
