import { AuthenticationRequest } from '@wenex/sdk/common';
import { SyncBody } from '@app/common/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  token(data: AuthenticationRequest): SyncBody {
    data.client_secret = process.env.CLIENT_SECRET;
    data.strict = !process.env.STRICT_TOKEN?.includes('false');

    return { data, type: 'assign' };
  }
}
