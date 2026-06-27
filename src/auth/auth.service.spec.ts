import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

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
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_SECRET: 'test-secret-32-chars-minimum-length!!',
        JWT_REFRESH_SECRET: 'test-refresh-secret-32-chars!!',
        JWT_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return map[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
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

      await expect(
        service.register({ name: 'Test', email: 'exists@test.com', password: 'Password1' }),
      ).rejects.toThrow('Email already registered');
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

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongPW1' }),
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
