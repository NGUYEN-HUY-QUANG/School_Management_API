import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/emuns/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      ...dto,
      role: Role.STUDENT,
    });
    return this.buildTokenResponse(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khoá');
    }

    return this.buildTokenResponse(user.id, user.email, user.role);
  }

  private buildTokenResponse(sub: string, email: string, role: string) {
    const payload = { sub, email, role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: sub, email, role },
    };
  }
}