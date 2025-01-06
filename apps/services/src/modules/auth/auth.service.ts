import { AuthenticationRequest } from '@wenex/sdk/common/interfaces/auth';
import { SyncBody } from '@app/common/core/interfaces';
import { CLIENT_CONFIG } from '@app/common/core/envs';
import { Injectable } from '@nestjs/common';

const { STRICT_TOKEN, CLIENT_SECRET } = CLIENT_CONFIG();

@Injectable()
export class AuthService {
  token(data: AuthenticationRequest): SyncBody<AuthenticationRequest> {
    data.strict = STRICT_TOKEN;
    data.client_secret = CLIENT_SECRET;
    return { data, type: 'assign' };
  }
}
