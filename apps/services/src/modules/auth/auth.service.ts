import {
  Auth,
  Headers,
  OAuthInfo,
  OAuthRequest,
  Registration,
  SyncBody,
  SyncEnd,
  Service as ServiceInterface,
  FilterOne,
} from '@app/common/interfaces';
import {
  AuthenticationRequest,
  GrantType,
  MongoId,
  Profile,
  ProfileDto,
  Query,
  Status,
  User,
  UserDto,
  UserOAuth,
} from '@wenex/sdk/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CLIENT_CONFIG, OAUTH_CONFIG } from '@app/common/configs';
import { TOTP_SECRET_BYTE_LENGTH } from '@app/common/consts';
import { date, expect, logger } from '@app/common/utils';
import { toKebabCase } from 'naming-conventions-modeler';
import { detectFile } from 'file-type-checker';
import { Service } from '@app/common/classes';
import { HttpService } from '@nestjs/axios';
import { Subject } from '@app/common/enums';
import { filterByNotation } from 'abacl';
import { SdkService } from '@app/sdk';
import * as crypto from 'crypto';
import * as qs from 'qs';

import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService
  extends Service<Auth, Auth>
  implements ServiceInterface<Auth, Auth>
{
  private readonly log = logger(AuthService.name);

  constructor(
    readonly repository: AuthRepository,

    private readonly sdkService: SdkService,
    private readonly httpService: HttpService,
  ) {
    super(repository);
  }

  async token(data: AuthenticationRequest, headers?: Headers): Promise<SyncBody> {
    data.client_secret = process.env.CLIENT_SECRET;
    data.strict = process.env.STRICT_TOKEN?.includes('true');

    if (data.grant_type === GrantType.OTP) {
      const { email, phone, username } = data;
      expect(
        email || phone || username,
        'one of the username or password or email is required',
        HttpStatus.BAD_REQUEST,
      );

      const findQuery: FilterOne<Auth> = { query: {} };
      if (email) findQuery.query.email = email;
      if (phone) findQuery.query.phone = phone;
      if (username) findQuery.query.username = username;

      const auth = await this.repository.findOne(findQuery);
      if (!auth?.uid) await this.userSecret(findQuery, headers);
    }

    return { data, type: 'assign' };
  }

  async userSecret(filter: FilterOne<Auth>, headers?: Headers) {
    const { identity } = this.sdkService.client();

    const user = (await identity.users.find(filter, { headers })).pop();
    expect(user?.id, 'user not found', HttpStatus.NOT_FOUND);

    const { id, email, phone, username } = user;
    const auth: Auth = { uid: id };

    if (email) auth.email = email;
    if (phone) auth.phone = phone;
    if (username) auth.username = username;

    if (!user.secret) {
      const secret = crypto.randomBytes(TOTP_SECRET_BYTE_LENGTH).toString('hex');
      await identity.users.updateById(user.id, { secret }, { headers });

      return await this.repository.create({ ...auth, secret });
    } else {
      this.log
        .get(toKebabCase(this.userSecret.name))
        .info(date('user already had a secret: %s'), user.secret);

      return await this.repository.create(auth);
    }
  }

  async register(data: Registration, headers?: Headers): Promise<SyncEnd> {
    const { identity } = this.sdkService.client();

    const { email, phone, username, password } = data;
    expect(
      email || phone || username,
      'one of the username or password or email is required',
      HttpStatus.BAD_REQUEST,
    );

    const id = MongoId();
    const { appId } = CLIENT_CONFIG();
    const payload: UserDto = {
      id,
      password,
      owner: id,
      created_in: appId,
      status: Status.Active,
      subjects: [Subject.Guest],
    };

    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    if (username) payload.username = username;

    const user = await identity.users.create(payload, { headers });

    const projection = 'id owner clients created_at created_by created_in'.split(/\s+/g);
    return filterByNotation(user, projection);
  }

  async oauth(data: OAuthRequest, headers?: Headers): Promise<SyncEnd> {
    switch (data.source) {
      case UserOAuth.Google: {
        const info = await this.getGoogleOAuthInfo(data);
        await this.userCredential(info, headers);
        return info;
      }
      case UserOAuth.Github: {
        const info = await this.getGithubOAuthInfo(data);
        await this.userCredential(info, headers);
        return info;
      }
      default:
        throw new HttpException('unknown source', HttpStatus.BAD_REQUEST);
    }
  }

  protected async userCredential(info: OAuthInfo, headers?: Headers) {
    const { identity } = this.sdkService.client();

    const findQuery: Query<User> = { email: info.email };
    const findUsers = await identity.users.find({ query: findQuery }, { headers });

    const user = findUsers.pop();
    if (!user?.id) {
      const id = MongoId();
      const { appId } = CLIENT_CONFIG();
      const { name, email, source, avatar } = info;
      await identity.users.create(
        {
          id,
          email,
          owner: id,
          oauth: [source],
          created_in: appId,
          status: Status.Active,
          subjects: [Subject.Guest],
          props:
            source === UserOAuth.Google
              ? { google_avatar: avatar, google_name: name }
              : { github_avatar: avatar, github_name: name },
        },
        { headers },
      );
    } else {
      const { appId } = CLIENT_CONFIG();
      const { name, avatar, source } = info;
      await identity.users.updateById(
        user.id,
        {
          updated_in: appId,
          oauth: [...new Set([...user.oauth, source])],
          props: Object.assign(
            user.props ?? {},
            source === UserOAuth.Google
              ? { google_avatar: avatar, google_name: name }
              : { github_avatar: avatar, github_name: name },
          ),
        },
        { headers },
      );
    }

    try {
      const { name, avatar } = info;
      await this.upsertProfile(user, name, avatar, headers);
    } catch (error) {
      this.log
        .get(toKebabCase(this.userCredential.name))
        .error(date('upsert profile failed with error %j'), error);
    }
  }

  protected async upsertProfile(
    user: User,
    name: string,
    avatar: string,
    headers?: Headers,
  ) {
    if (!avatar || !user?.id) return;

    const { identity } = this.sdkService.client();
    const { appId, rootDomainName } = CLIENT_CONFIG();

    const query: Query<Profile> = { owner: user.id, groups: rootDomainName };
    const profile = (await identity.profiles.find({ query }, { headers })).pop();

    if (!profile?.id) {
      const file = await this.uploadAvatar(user, avatar, headers);

      const payload: ProfileDto = { created_in: appId, owner: user.id };
      if (name) Object.assign(payload, { nickname: name });
      if (file?.id) Object.assign(payload, { avatar: file?.id });

      return identity.profiles.create(payload, { headers });
    } else {
      const payload: Partial<ProfileDto> = {};
      if (name) Object.assign(payload, { nickname: name });

      if (!profile.avatar) {
        const file = await this.uploadAvatar(user, avatar, headers);
        if (file?.id) Object.assign(payload, { avatar: file.id });
      }

      return identity.profiles.updateById(profile.id, payload);
    }
  }

  private async uploadAvatar(user: User, avatar: string, headers?: Headers) {
    if (!avatar || !user?.id) return;

    const { special } = this.sdkService.client();

    const blb = await this.httpService.axiosRef.get(avatar, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(blb.data, 'binary');
    const { extension: ext } = detectFile(buffer);
    const file = (
      await special.files.upload(
        [{ value: new Blob([buffer]), filename: `avatar.${ext}` }],
        'private',
        { headers },
      )
    ).pop();

    if (file?.id) {
      const { appId } = CLIENT_CONFIG();
      return await special.files.updateById(file.id, {
        owner: user.id,
        created_in: appId,
      });
    }
  }

  private async getGithubOAuthInfo(oauth: OAuthRequest): Promise<OAuthInfo> {
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
    expect(String(access_token), 'access_token not found', HttpStatus.NOT_FOUND);

    const { data: userInfo } = await this.httpService.axiosRef.get<{
      avatar_url: string;
      name: string;
      email: string;
    }>('https://api.github.com/user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: 'Bearer ' + access_token,
      },
    });
    expect(userInfo.email, 'email not found', HttpStatus.NOT_FOUND);

    const { email, avatar_url, name } = userInfo;
    return { email, name, avatar: avatar_url, secret: String(access_token), source };
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
    }>('https://www.googleapis.com/oauth2/v2/userinfo', {
      params: { access_token: access_token },
      headers: { 'Content-Type': ' application/json' },
    });

    if (!userInfo.verified_email)
      throw new HttpException('email not verified', HttpStatus.NOT_ACCEPTABLE);
    expect(userInfo.email, 'email not verified', HttpStatus.NOT_FOUND);

    const { email, picture, name } = userInfo;
    return { email, name, avatar: picture, secret: access_token, source };
  }
}
