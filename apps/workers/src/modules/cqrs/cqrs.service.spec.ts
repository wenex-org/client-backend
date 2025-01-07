import { Test, TestingModule } from '@nestjs/testing';

import { CqrsService } from './cqrs.service';

describe('CqrsService', () => {
  let service: CqrsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CqrsService],
    }).compile();

    service = module.get<CqrsService>(CqrsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
