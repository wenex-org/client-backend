import { assertion, clientConfig } from '@app/common/core/utils';
import { Headers } from '@wenex/sdk/common/core/interfaces';
import { HttpStatus, Injectable } from '@nestjs/common';
import { SyncEnd } from '@app/common/core/interfaces';
import { SdkService } from '@app/module/sdk';

@Injectable()
export class PublicService {
  constructor(private readonly sdk: SdkService) {}

  async agent(id: string, headers?: Headers): Promise<SyncEnd> {
    const { domain } = this.sdk.client;
    const app = await domain.apps.findById(id, {
      params: {
        projection: 'id cid url site type name logo status slogan version created_at',
      },
      ...clientConfig(headers),
    });
    const client = (
      await domain.clients.find(
        { query: { $or: [{ id: app?.cid ?? id }, { client_id: id }] } },
        {
          params: {
            projection: 'id url plan site logo name state status slogan created_at domains.name domains.status',
          },
          ...clientConfig(headers),
        },
      )
    )?.pop();
    assertion(client, 'client not found', HttpStatus.NOT_FOUND);
    return app?.id ? { app, client } : { client };
  }
}
