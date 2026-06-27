"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, config) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.prisma.business.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
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
    async login(dto) {
        const business = await this.prisma.business.findUnique({
            where: { email: dto.email },
        });
        if (!business) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(dto.password, business.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.generateTokens(business.id, business.email, business.name, business.plan, business.subscriptionStatus, business.avatarUrl);
    }
    async getProfile(businessId) {
        const business = await this.prisma.business.findUnique({
            where: { id: businessId },
            select: { id: true, name: true, email: true, plan: true, subscriptionStatus: true, planUpdatedAt: true, createdAt: true, avatarUrl: true },
        });
        if (!business) {
            throw new common_1.UnauthorizedException('Business not found');
        }
        return business;
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-referloop-2024',
            });
            const business = await this.prisma.business.findUnique({
                where: { id: payload.sub },
            });
            if (!business) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            return this.generateTokens(business.id, business.email, business.name, business.plan, business.subscriptionStatus, business.avatarUrl);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    generateTokens(businessId, email, name, plan, subscriptionStatus, avatarUrl) {
        const payload = { sub: businessId, email };
        const jwtSecret = this.config.get('JWT_SECRET');
        const jwtRefreshSecret = this.config.get('JWT_REFRESH_SECRET');
        if (!jwtSecret || !jwtRefreshSecret) {
            throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment');
        }
        const accessToken = this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn: this.config.get('JWT_EXPIRATION') || '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: jwtRefreshSecret,
            expiresIn: this.config.get('JWT_REFRESH_EXPIRATION') || '7d',
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
    async updateAvatar(businessId, avatarUrl) {
        await this.prisma.business.update({
            where: { id: businessId },
            data: { avatarUrl },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map