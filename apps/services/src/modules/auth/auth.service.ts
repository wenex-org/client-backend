import {
  ConfirmRegister,
  OAuthRequest,
  OAuthResponse,
  OtpRequest,
  RegisterRequest,
  RegisterResponse,
  RepassRequest,
  RepassResponse,
} from '@app/common/interfaces/auth';
import { AuthModel, OAuthModel, RegisterModel, RepassModel } from '@app/common/models/auth';
import { AuthenticationRequest } from '@wenex/sdk/common/interfaces/auth';
import { Headers, Result } from '@wenex/sdk/common/core/interfaces';
import { EmailSendDto } from '@wenex/sdk/common/interfaces/touch';
import { SyncBody, SyncEnd } from '@app/common/core/interfaces';
import { get, logger } from '@wenex/sdk/common/core/utils';
import { GrantType } from '@wenex/sdk/common/core/enums';
import { TemplateType } from '@app/common/enums/touch';
import { MAIL_FROM } from '@app/common/core/constants';
import { CLIENT_CONFIG } from '@app/common/core/envs';
import { RepassType } from '@app/common/enums/auth';
import { BackupService } from '@app/module/backup';
import { rpcCatch } from '@app/common/core/utils';
import { RedisService } from '@app/module/redis';
import { SdkService } from '@app/module/sdk';
import { Injectable } from '@nestjs/common';

import { TouchService } from '../touch';

const { STRICT_TOKEN, CLIENT_SECRET } = CLIENT_CONFIG();

@Injectable()
export class AuthService {
  private readonly log = logger(AuthService.name);

  constructor(
    private readonly db: BackupService,
    private readonly sdkService: SdkService,
    private readonly redisService: RedisService,
    private readonly touchService: TouchService,
  ) {}

  async otp(data: OtpRequest, headers?: Headers): Promise<SyncEnd<Result>> {
    const model = AuthModel.build(data).check();
    await model.verifyCaptcha(get('x-user-ip', headers));

    const { users } = this.sdkService.client.identity;
    const options = await model.userSecret(this.db, users, headers);

    const { smss } = this.sdkService.client.touch;
    const services = { mails: this.touchService.mails, smss };
    return model.otp(services, options, headers);
  }

  async token(data: AuthenticationRequest, headers?: Headers): Promise<SyncBody<AuthenticationRequest>> {
    data.strict = STRICT_TOKEN;

    if (data.grant_type !== GrantType.refresh_token) {
      const model = AuthModel.build(data).check();
      await model.verifyCaptcha(get('x-user-ip', headers));
    }

    if (data.grant_type !== GrantType.client_credential) {
      data.client_secret = CLIENT_SECRET;
    }

    return { data, type: 'assign' };
  }

  async oauth(data: OAuthRequest, headers?: Headers): Promise<SyncEnd<OAuthResponse>> {
    const model = OAuthModel.build(data).check();
    const { users } = this.sdkService.client.identity;
    return model.sso(users, headers);
  }

  async repass(data: RepassRequest, headers?: Headers): Promise<SyncEnd<RepassResponse>> {
    const model = RepassModel.build(data).check(headers);
    await model.verifyCaptcha();

    const { users } = this.sdkService.client.identity;
    const result = await model.repass(users, this.redisService);

    if (data.type === RepassType.FORGOT) {
      const { smss } = this.sdkService.client.touch;
      const services = { smss, mails: this.touchService.mails };
      void model.sendResetLink(services).catch(rpcCatch);
    }

    return result;
  }

  async register(data: RegisterRequest, headers?: Headers): Promise<SyncEnd<RegisterResponse>> {
    const model = RegisterModel.build(data).check(headers);
    await model.verifyCaptcha();

    const { users } = this.sdkService.client.identity;
    const result = await model.register(users, this.redisService);

    const { smss } = this.sdkService.client.touch;
    const services = { smss, mails: this.touchService.mails };
    void model.sendVerification(services).catch(rpcCatch);

    return result;
  }

  async confirmation(data: ConfirmRegister, headers?: Headers): Promise<SyncEnd<Result>> {
    const { users } = this.sdkService.client.identity;
    const { email } = await RegisterModel.confirmation(data, { users, redis: this.redisService }, headers);

    void (async () => {
      if (email) {
        const options: Omit<EmailSendDto, 'html' | 'text'> = { from: MAIL_FROM, to: [email], subject: 'Welcome' };
        const result = await this.touchService.mails.send({ template: TemplateType.WELCOME, options }, headers);
        this.log.extend(this.confirmation.name)(`welcome email sent to ${email} with result %o`, result);
      }
    })().catch(rpcCatch);

    return { result: 'OK' };
  }
}
