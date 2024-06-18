import { Auth, AuthSchema } from '@app/common/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { MailsModule } from '../mails';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';

@Module({
  imports: [
    HttpModule.register({ timeout: +(process.env.TIMEOUT || 30000) }),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),

    ...[MailsModule],
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
})
export class AuthModule {}
