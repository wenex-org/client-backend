import {
  Headers,
  OAuthInfo,
  OAuthRequest,
  SyncBody,
  SyncEnd,
} from '@app/common/interfaces';
import { AuthenticationRequest, Query, User, UserOAuth } from '@wenex/sdk/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OAUTH_CONFIG } from '@app/common/configs';
import { HttpService } from '@nestjs/axios';
import { SdkService } from '@app/sdk';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly sdkService: SdkService,
  ) {}

  token(data: AuthenticationRequest): SyncBody {
    data.client_secret = process.env.CLIENT_SECRET;
    data.strict = !process.env.STRICT_TOKEN?.includes('false');

    return { data, type: 'assign' };
  }

  async oauth(data: OAuthRequest, headers?: Headers): Promise<SyncEnd> {
    switch (data.source) {
      case UserOAuth.Google:
        const info = await this.getGoogleOAuthInfo(data);
        return this.userCredential(info, headers);
      case UserOAuth.Github:
        break;
      default:
        throw new HttpException('undefined source', HttpStatus.BAD_REQUEST);
    }
  }

  protected async userCredential(info: OAuthInfo, headers: Headers) {
    const { identity } = this.sdkService.client();

    const findQuery: Query<User> = { email: info.email };
    const findUser = await identity.users.find({ query: findQuery }, { headers });

    return findUser;
  }

  private async getGoogleOAuthInfo({ code }: { code: string }): Promise<OAuthInfo> {
    const { GOOGLE } = OAUTH_CONFIG();

    const payload = {
      code,
      grant_type: 'authorization_code',
      client_id: GOOGLE.clientId,
      client_secret: GOOGLE.clientSecret,
      redirect_uri: GOOGLE.redirect_uri,
    };

    const { data } = await this.httpService.axiosRef.post<{ access_token: string }>(
      'https://oauth2.googleapis.com/token',
      payload,
    );

    const { data: userInfo } = await this.httpService.axiosRef.get<{
      email: string;
      verified_email: boolean;
      picture: string;
    }>('https://www.googleapis.com/oauth2/v2/userinfo', {
      params: { access_token: data.access_token },
      headers: { 'Content-Type': ' application/json' },
    });

    if (!userInfo.verified_email)
      throw new HttpException('email not verified', HttpStatus.NOT_ACCEPTABLE);

    return { email: userInfo.email, avatar: userInfo.picture };
  }
}
