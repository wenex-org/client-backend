import { Inject, Injectable, Scope } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly req: Request,
  ) {}

  async all() {}
}
