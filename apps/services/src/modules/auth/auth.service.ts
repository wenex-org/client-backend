import { ConfirmRegister, RegisterRequest, RegisterResponse } from '@app/common/interfaces/auth';
import { AuthenticationRequest } from '@wenex/sdk/common/interfaces/auth';
import { Headers, Result } from '@wenex/sdk/common/core/interfaces';
import { AuthModel, RegisterModel } from '@app/common/models/auth';
import { SyncBody, SyncEnd } from '@app/common/core/interfaces';
import { CLIENT_CONFIG } from '@app/common/core/envs';
import { get } from '@wenex/sdk/common/core/utils';
import { RedisService } from '@app/module/redis';
import { SdkService } from '@app/module/sdk';
import { Injectable } from '@nestjs/common';

import { TouchService } from '../touch';

const { STRICT_TOKEN, CLIENT_SECRET } = CLIENT_CONFIG();

@Injectable()
export class AuthService {
  constructor(
    private readonly sdkService: SdkService,
    private readonly redisService: RedisService,
    private readonly touchService: TouchService,
  ) {}

  async token(data: AuthenticationRequest, headers?: Headers): Promise<SyncBody<AuthenticationRequest>> {
    data.strict = STRICT_TOKEN;
    data.client_secret = CLIENT_SECRET;

    const model = AuthModel.build(data).check();
    await model.verifyCaptcha(get('x-user-ip', headers));

    return { data, type: 'assign' };
  }

  async register(data: RegisterRequest, headers?: Headers): Promise<SyncEnd<RegisterResponse>> {
    const model = RegisterModel.build(data).check();
    await model.verifyCaptcha(get('x-user-ip', headers));

    const { users } = this.sdkService.client.identity;
    const result = await model.register(users, this.redisService, headers);

    const { smss } = this.sdkService.client.touch;
    const services = { smss, mails: this.touchService.mails };
    void model.sendVerification(services, headers);

    return result;
  }

  async confirmation(data: ConfirmRegister, headers?: Headers): Promise<SyncEnd<Result>> {
    const { users } = this.sdkService.client.identity;
    await RegisterModel.confirmation(data, { users, redis: this.redisService }, headers);
    return { result: 'OK' };
  }
}
