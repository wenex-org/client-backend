import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { ProxyModule } from './proxy.module';

describe('ProxyService', () => {
  let service: ProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProxyModule],
    }).compile();

    service = await module.resolve<ProxyService>(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
