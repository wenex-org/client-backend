import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register(data: any) {
    console.log('user registration', data);
  }
}
