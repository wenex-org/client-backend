import { Headers } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';
import { wrap } from '@app/common/utils';
import { SdkService } from '@app/sdk';

@Injectable()
export class PublicService {
  constructor(private readonly sdkService: SdkService) {}

  async getHost(id: string, headers?: Headers) {
    const sdk = await this.sdkService.asClient(headers);

    const app = await sdk.domain.apps.findById(id, { headers });

    const client = (
      await sdk.domain.clients.find(
        {
          query: { $or: [{ id }, { client_id: id }] },
        },
        { headers },
      )
    )?.pop();

    return wrap({ app, client }, 'end');
  }
}
