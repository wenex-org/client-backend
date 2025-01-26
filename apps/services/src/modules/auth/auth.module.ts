import { Module } from '@nestjs/common';

import { TouchModule } from '../touch';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [TouchModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
