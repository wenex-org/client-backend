import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthProvider } from './auth.provider';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.PLATFORM_URL,
      timeout: +(process.env.TIMEOUT || 30000),
      headers: { 'x-api-key': process.env.API_KEY },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthProvider],
})
export class AuthModule {}
