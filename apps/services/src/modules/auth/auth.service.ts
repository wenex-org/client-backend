import {
  Headers,
  OAuthInfo,
  OAuthRequest,
  SyncBody,
  SyncEnd,
} from '@app/common/interfaces';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthenticationRequest, UserOAuth } from '@wenex/sdk/common';
import { OAUTH_CONFIG } from '@app/common/configs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  token(data: AuthenticationRequest): SyncBody {
    data.client_secret = process.env.CLIENT_SECRET;
    data.strict = !process.env.STRICT_TOKEN?.includes('false');

    return { data, type: 'assign' };
  }

  async oauth(data: OAuthRequest, headers?: Headers): Promise<SyncEnd> {
    switch (data.source) {
      case UserOAuth.Google:
        return this.getGoogleUserInfo(data);
      case UserOAuth.Github:
        break;
      default:
        throw new HttpException('oauth source is not supported', HttpStatus.BAD_REQUEST);
    }
  }

  private async getGoogleUserInfo({ code }: { code: string }): Promise<OAuthInfo> {
    const { GOOGLE } = OAUTH_CONFIG();

    const payload = {
      code,
      client_id: GOOGLE.clientId,
      client_secret: GOOGLE.clientSecret,
      grant_type: 'authorization_code',
    };

    const { data } = await this.httpService.axiosRef.post(
      'https://oauth2.googleapis.com/token',
      payload,
    );

    return { email: data };
  }
}
