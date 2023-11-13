import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AuthClient } from 'platform-sdk';

@Injectable()
export class AuthProvider {
  public readonly client: AuthClient;

  constructor(protected readonly httpService: HttpService) {
    this.client = new AuthClient(httpService.axiosRef);
  }
}
