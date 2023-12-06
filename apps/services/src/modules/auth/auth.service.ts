import {
  Headers,
  OAuthInfo,
  OAuthRequest,
  SyncBody,
  SyncEnd,
} from '@app/common/interfaces';
import { AuthenticationRequest, Query, Status, User, UserOAuth } from '@wenex/sdk/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OAUTH_CONFIG } from '@app/common/configs';
import { HttpService } from '@nestjs/axios';
import { Subject } from '@app/common/enums';
import { expect } from '@app/common/utils';
import { SdkService } from '@app/sdk';
import * as qs from 'qs';

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
        return this.getGithubOAuthInfo(data);
        break;
      default:
        throw new HttpException('undefined source', HttpStatus.BAD_REQUEST);
    }
  }

  protected async userCredential(info: OAuthInfo, headers: Headers) {
    const { identity } = this.sdkService.client();

    const findQuery: Query<User> = { email: info.email };
    const findUsers = await identity.users.find({ query: findQuery }, { headers });

    let user = findUsers.pop();
    if (!user) {
      const { email, source } = info;
      user = await identity.users.create(
        {
          email,
          oauth: [source],
          status: Status.Active,
          subjects: [Subject.Guest],
          // props: { google_avatar: avatar },
        },
        { headers },
      );
    }

    return user;
  }

  private async getGithubOAuthInfo(oauth: OAuthRequest) {
    const { code, source } = oauth;
    const { GITHUB } = OAUTH_CONFIG();

    const payload = {
      code,
      client_id: GITHUB.clientId,
      client_secret: GITHUB.clientSecret,
    };

    const { data } = await this.httpService.axiosRef.post<string>(
      'https://github.com/login/oauth/access_token',
      payload,
    );

    const { access_token } = qs.parse(data);
    expect(access_token, 'access_token not found', HttpStatus.NOT_FOUND);

    const { data: userInfo } = await this.httpService.axiosRef.get<{
      avatar_url: string;
      name: string;
      email: string;
      login: string;
      location: string;
    }>('https://api.github.com/user', {
      headers: { Authorization: 'Bearer ' + access_token },
    });

    expect(userInfo.email, 'email not found', HttpStatus.NOT_FOUND);

    const { email, avatar_url, name } = userInfo;
    return { email, name, avatar: avatar_url, secret: access_token, source };
  }

  private async getGoogleOAuthInfo(oauth: OAuthRequest): Promise<OAuthInfo> {
    const { code, source } = oauth;
    const { GOOGLE } = OAUTH_CONFIG();

    const payload = {
      code,
      grant_type: 'authorization_code',
      client_id: GOOGLE.clientId,
      client_secret: GOOGLE.clientSecret,
      redirect_uri: GOOGLE.redirect_uri,
    };

    const {
      data: { access_token },
    } = await this.httpService.axiosRef.post<{ access_token: string }>(
      'https://oauth2.googleapis.com/token',
      payload,
    );
    expect(access_token, 'access_token not found', HttpStatus.NOT_FOUND);

    const { data: userInfo } = await this.httpService.axiosRef.get<{
      email: string;
      verified_email: boolean;
      picture: string;
      name: string;
      locale: string;
    }>('https://www.googleapis.com/oauth2/v2/userinfo', {
      params: { access_token: access_token },
      headers: { 'Content-Type': ' application/json' },
    });

    if (!userInfo.verified_email)
      throw new HttpException('email not verified', HttpStatus.NOT_ACCEPTABLE);
    expect(userInfo.email, 'email not found', HttpStatus.NOT_FOUND);

    const { email, picture, name } = userInfo;
    return { email, name, avatar: picture, secret: access_token, source };
  }
}
