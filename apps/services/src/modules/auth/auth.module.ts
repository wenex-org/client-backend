import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [HttpModule.register({ timeout: +(process.env.TIMEOUT || 30000) })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
