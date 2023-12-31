import { Test, TestingModule } from '@nestjs/testing';

import { MirrorService } from './mirror.service';

describe('MirrorService', () => {
  let service: MirrorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MirrorService],
    }).compile();

    service = module.get<MirrorService>(MirrorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
