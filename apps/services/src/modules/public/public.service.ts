import { Headers, SyncEnd } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { SdkService } from '@app/sdk';

@Injectable()
export class PublicService {
  constructor(private readonly sdkService: SdkService) {}

  async getHost(id: string, headers?: Headers): Promise<SyncEnd> {
    const { domain } = this.sdkService.client();

    const app = await domain.apps.findById(id, {
      headers,
      params: {
        projection: 'id cid url site type name logo status slogan version created_at',
      },
    });

    const client = (
      await domain.clients.find(
        {
          query: { $or: [app.cid ? { id: app.cid } : { id }, { client_id: id }] },
        },
        {
          headers,
          params: {
            projection: 'id url plan site logo name state status slogan created_at domains.name domains.status domains.subjects',
          },
        },
      )
    )?.pop();

    return app?.id ? { app, client } : { client };
  }
}
