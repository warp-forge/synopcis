import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDomainService, UserEntity } from '@synop/domains';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserDomainService,
    private readonly jwtService: JwtService,
  ) {}

  async login(nickname: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findByNickname(nickname);
    if (!user || !user.password || !await bcrypt.compare(pass, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { nickname: user.nickname, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(nickname: string, email: string, pass: string): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(pass, 10);
    return this.userService.create({
      nickname,
      email,
      password: hashedPassword,
    });
  }
}
