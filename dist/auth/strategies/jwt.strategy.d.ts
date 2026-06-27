import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    validate(payload: any): Promise<{
        businessId: any;
        email: any;
    }>;
}
export {};
