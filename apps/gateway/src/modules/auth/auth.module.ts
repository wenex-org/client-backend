import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthProvider } from './auth.provider';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.PLATFORM_URL,
      headers: { 'api-key': process.env.API_KEY },
      timeout: parseInt(process.env.TIMEOUT || '30000'),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthProvider],
})
export class AuthModule {}
