import {
  Auth as AuthInterface,
  Repository as RepositoryInterface,
} from '@app/common/interfaces';
import { Repository } from '@app/common/classes';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Auth } from './schema';

@Injectable()
export class AuthRepository
  extends Repository<AuthInterface, AuthInterface>
  implements RepositoryInterface<AuthInterface, AuthInterface>
{
  constructor(@InjectModel(Auth.name) readonly model: Model<AuthInterface>) {
    super(model);
  }
}
