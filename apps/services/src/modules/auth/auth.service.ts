import { AuthenticationRequest } from '@wenex/sdk/common/interfaces/auth';
import { Headers } from '@wenex/sdk/common/core/interfaces';
import { SyncBody } from '@app/common/core/interfaces';
import { CLIENT_CONFIG } from '@app/common/core/envs';
import { AuthModel } from '@app/common/models/auth';
import { get } from '@wenex/sdk/common/core/utils';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

const { STRICT_TOKEN, CLIENT_SECRET } = CLIENT_CONFIG();

@Injectable()
export class AuthService {
  constructor(private readonly http: HttpService) {}

  async token(data: AuthenticationRequest, headers?: Headers): Promise<SyncBody<AuthenticationRequest>> {
    data.strict = STRICT_TOKEN;
    data.client_secret = CLIENT_SECRET;

    const model = AuthModel.build(data).check();
    await model.verifyCaptcha(get('x-user-ip', headers), this.http.axiosRef);

    return { data, type: 'assign' };
  }
}
