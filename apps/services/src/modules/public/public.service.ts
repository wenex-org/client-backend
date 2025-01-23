import { Headers } from '@wenex/sdk/common/core/interfaces';
import { SyncEnd } from '@app/common/core/interfaces';
import { SdkService } from '@app/module/sdk';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PublicService {
  constructor(private readonly sdk: SdkService) {}

  async agent(id: string, headers?: Headers): Promise<SyncEnd> {
    const { domain } = this.sdk.client;
    const app = await domain.apps.findById(id, {
      params: {
        projection: 'id cid url site type name logo status slogan version created_at',
      },
      headers,
    });
    const client = (
      await domain.clients.find(
        { query: { $or: [{ id: app?.cid ?? id }, { client_id: id }] } },
        {
          params: {
            projection: 'id url plan site logo name state status slogan created_at domains.name domains.status domains.subjects',
          },
          headers,
        },
      )
    )?.pop();
    return app?.id ? { app, client } : { client };
  }
}
