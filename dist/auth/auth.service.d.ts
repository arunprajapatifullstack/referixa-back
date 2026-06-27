import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        business: {
            id: string;
            email: string;
            name: string;
            plan: string;
            subscriptionStatus: string;
            avatarUrl: string | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        business: {
            id: string;
            email: string;
            name: string;
            plan: string;
            subscriptionStatus: string;
            avatarUrl: string | null;
        };
    }>;
    getProfile(businessId: string): Promise<{
        name: string;
        email: string;
        id: string;
        plan: string;
        subscriptionStatus: string;
        planUpdatedAt: Date | null;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        business: {
            id: string;
            email: string;
            name: string;
            plan: string;
            subscriptionStatus: string;
            avatarUrl: string | null;
        };
    }>;
    private generateTokens;
    updateAvatar(businessId: string, avatarUrl: string): Promise<void>;
}
