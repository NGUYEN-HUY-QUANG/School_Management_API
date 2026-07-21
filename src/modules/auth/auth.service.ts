import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
) {}

async login(dto: LoginDto) {
  const user = await this.userService.findByUsername(dto.username);

  if (!user) {
    throw new UnauthorizedException('Invalid username or password');
  }

  const isMatch = await bcrypt.compare(
    dto.password,
    user.password,
  );

  if (!isMatch) {
    throw new UnauthorizedException('Invalid username or password');
  }

  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = await this.jwtService.signAsync(payload);

  return {
    access_token: accessToken,
  };
}
}