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
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
describe('AuthService', () => {
    let service;
    let prisma;
    const mockPrisma = {
        business: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };
    const mockJwt = {
        sign: jest.fn().mockReturnValue('mock-token'),
        verify: jest.fn(),
    };
    const mockConfig = {
        get: jest.fn((key) => {
            const map = {
                JWT_SECRET: 'test-secret-32-chars-minimum-length!!',
                JWT_REFRESH_SECRET: 'test-refresh-secret-32-chars!!',
                JWT_EXPIRATION: '15m',
                JWT_REFRESH_EXPIRATION: '7d',
            };
            return map[key];
        }),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: jwt_1.JwtService, useValue: mockJwt },
                { provide: config_1.ConfigService, useValue: mockConfig },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        prisma = module.get(prisma_service_1.PrismaService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('register', () => {
        it('should create a business and return tokens', async () => {
            const dto = { name: 'Test Co', email: 'test@example.com', password: 'Password1' };
            const hashed = await bcrypt.hash(dto.password, 12);
            const mockBusiness = { id: 'uuid', name: dto.name, email: dto.email, passwordHash: hashed, plan: 'free', subscriptionStatus: 'inactive', createdAt: new Date() };
            mockPrisma.business.findUnique.mockResolvedValue(null);
            mockPrisma.business.create.mockResolvedValue(mockBusiness);
            const result = await service.register(dto);
            expect(result.accessToken).toBe('mock-token');
            expect(result.refreshToken).toBe('mock-token');
            expect(result.business.email).toBe(dto.email);
            expect(mockPrisma.business.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ email: dto.email, name: dto.name }),
            });
        });
        it('should throw if email already exists', async () => {
            mockPrisma.business.findUnique.mockResolvedValue({ id: 'existing' });
            await expect(service.register({ name: 'Test', email: 'exists@test.com', password: 'Password1' })).rejects.toThrow('Email already registered');
        });
    });
    describe('login', () => {
        it('should validate credentials and return tokens', async () => {
            const password = 'Password1';
            const hashed = await bcrypt.hash(password, 12);
            const mockBusiness = { id: 'uuid', name: 'Test Co', email: 'test@test.com', passwordHash: hashed, plan: 'free', subscriptionStatus: 'inactive', avatarUrl: null, createdAt: new Date() };
            mockPrisma.business.findUnique.mockResolvedValue(mockBusiness);
            const result = await service.login({ email: 'test@test.com', password });
            expect(result.accessToken).toBe('mock-token');
            expect(result.business.email).toBe('test@test.com');
        });
        it('should throw on wrong password', async () => {
            const hashed = await bcrypt.hash('correctPW1', 12);
            mockPrisma.business.findUnique.mockResolvedValue({ id: 'uuid', passwordHash: hashed });
            await expect(service.login({ email: 'test@test.com', password: 'wrongPW1' })).rejects.toThrow('Invalid credentials');
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map