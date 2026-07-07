import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Un compte existe déjà avec cet email');

    const user = await this.usersService.create(dto);
    return this.buildToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    if (!user.isActive) throw new UnauthorizedException('Compte désactivé');

    const isValid = await this.usersService.comparePasswords(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Identifiants invalides');

    return this.buildToken(user.id, user.email, user.role);
  }

  private buildToken(sub: string, email: string, role: string) {
    const payload = { sub, email, role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: sub, email, role },
    };
  }
}
