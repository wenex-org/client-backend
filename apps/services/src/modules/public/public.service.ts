import { Headers } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { SdkService } from '@app/sdk';

@Injectable()
export class PublicService {
  constructor(private readonly sdkService: SdkService) {}

  async getHost(id: string, headers?: Headers) {
    const app = await this.sdkService.client.domain.apps.findById(id, {
      headers,
      params: { zone: 'client' },
    });

    const client = (
      await this.sdkService.client.domain.clients.find(
        {
          query: { $or: [{ id }, { client_id: id }] },
        },
        {
          headers,
          params: {
            projection: {
              status: 1,
              state: 1,
              logo: 1,
              name: 1,
              slogan: 1,
              created_at: 1,
              'domains.name': 1,
              'domains.status': 1,
              'domains.subjects': 1,
            },
            zone: 'client',
          },
        },
      )
    )?.pop();

    return { app, client };
  }
}
