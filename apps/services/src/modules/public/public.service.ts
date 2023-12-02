import { SyncEnd } from '@app/common/interfaces';
import { App, Client } from '@wenex/sdk/common';
import { Injectable } from '@nestjs/common';
import { SdkService } from '@app/sdk';

@Injectable()
export class PublicService {
  constructor(private readonly sdkService: SdkService) {}

  async getHost(id: string): Promise<SyncEnd<{ app: App; client: Client }>> {
    const sdk = await this.sdkService.asClient();

    const app = await sdk.domain.apps.findById(id);

    const client = (
      await sdk.domain.clients.find({
        query: { $or: [{ id }, { client_id: id }] },
      })
    )?.pop();

    return { end: { app, client } };
  }
}
