import { Headers } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { SdkService } from '@app/sdk';

@Injectable()
export class PublicService {
  constructor(private readonly sdkService: SdkService) {}

  async getHost(id: string, headers?: Headers) {
    await this.sdkService.reset({ headers });
    const sdk = await this.sdkService.asClient();

    const app = await sdk.domain.apps.findById(id, {
      headers,
      params: { zone: 'client' },
    });

    const client = (
      await sdk.domain.clients.find(
        {
          query: { $or: [{ id }, { client_id: id }] },
        },
        { headers, params: { zone: 'client' } },
      )
    )?.pop();

    return { app, client };
  }
}
