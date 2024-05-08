import { Headers, SyncEnd } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { Wallet } from '@wenex/sdk/common';
import { SdkService } from '@app/sdk';

@Injectable()
export class WalletsService {
  constructor(private readonly sdkService: SdkService) {}

  async sync(data: any, headers?: Headers): Promise<SyncEnd<Wallet>> {
    const { financial } = this.sdkService.client();

    const wallet = await financial.wallets.findById(data.id, { headers });
    // const coin = await financial.coins.findById(wallet.coin, { headers });

    return wallet;
  }
}
