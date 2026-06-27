import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.business.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const business = await this.prisma.business.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
    });

    return this.generateTokens(business.id, business.email, business.name, business.plan, business.subscriptionStatus, business.avatarUrl);
  }

  async login(dto: LoginDto) {
    const business = await this.prisma.business.findUnique({
      where: { email: dto.email },
    });
    if (!business) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, business.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(business.id, business.email, business.name, business.plan, business.subscriptionStatus, business.avatarUrl);
  }

  async getProfile(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, email: true, plan: true, subscriptionStatus: true, planUpdatedAt: true, createdAt: true, avatarUrl: true },
    });
    if (!business) {
      throw new UnauthorizedException('Business not found');
    }
    return business;
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-referloop-2024',
      });
      const business = await this.prisma.business.findUnique({
        where: { id: payload.sub },
      });
      if (!business) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.generateTokens(business.id, business.email, business.name, business.plan, business.subscriptionStatus, business.avatarUrl);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(businessId: string, email: string, name?: string, plan?: string, subscriptionStatus?: string, avatarUrl?: string | null) {
    const payload = { sub: businessId, email };
    const jwtSecret = this.config.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment');
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: this.config.get<string>('JWT_EXPIRATION') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtRefreshSecret,
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    });

    return {
      accessToken,
      refreshToken,
      business: {
        id: businessId,
        email,
        name: name || '',
        plan: plan || 'free',
        subscriptionStatus: subscriptionStatus || 'inactive',
        avatarUrl: avatarUrl || null,
      },
    };
  }

  async updateAvatar(businessId: string, avatarUrl: string) {
    await this.prisma.business.update({
      where: { id: businessId },
      data: { avatarUrl },
    });
  }
}
