import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsService } from './referrals.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

describe('ReferralsService', () => {
  let service: ReferralsService;

  const mockPrisma = {
    referralLink: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    referral: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
    reward: { create: jest.fn(), findFirst: jest.fn(), createMany: jest.fn() },
    customer: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), upsert: jest.fn(), count: jest.fn() },
    campaign: { findUnique: jest.fn(), update: jest.fn() },
    business: { findUnique: jest.fn() },
  };

  const mockMail = { sendReferralConfirmation: jest.fn().mockResolvedValue(undefined), sendConversionRewards: jest.fn().mockResolvedValue(undefined), sendReferrerRewardNotification: jest.fn().mockResolvedValue(undefined) };
  const mockConfig = { get: jest.fn().mockReturnValue('http://localhost:3000') };

  const linkMock = {
    id: 'link-id',
    campaignId: 'camp-id',
    customerId: 'cust-id',
    code: 'ABC123',
    campaign: {
      id: 'camp-id',
      businessId: 'biz-id',
      name: 'Test Campaign',
      status: 'active',
      referrerRewardType: 'discount',
      referrerRewardValue: 100,
      referredRewardType: 'discount',
      referredRewardValue: 50,
    },
    customer: { id: 'cust-id', email: 'referrer@test.com', name: 'Referrer' },
  };

  const bizMock = { id: 'biz-id', plan: 'pro', name: 'Test Co', _count: { customers: 5 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MailService, useValue: mockMail },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convert', () => {
    it('should reject self-referral', async () => {
      mockPrisma.referralLink.findUnique.mockResolvedValue({
        ...linkMock,
        customer: { id: 'cust-id', email: 'same@test.com', name: 'Referrer' },
      });

      await expect(
        service.convert({ code: 'ABC123', referredEmail: 'same@test.com' }),
      ).rejects.toThrow('You cannot refer yourself');
    });

    it('should reject duplicate email', async () => {
      mockPrisma.referralLink.findUnique.mockResolvedValue(linkMock);
      mockPrisma.referral.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.convert({ code: 'ABC123', referredEmail: 'friend@test.com' }),
      ).rejects.toThrow('already been referred');
    });

    it('should reject duplicate ip within 24h', async () => {
      mockPrisma.referralLink.findUnique.mockResolvedValue(linkMock);

      mockPrisma.referral.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'existing', ipAddress: '127.0.0.1', convertedAt: new Date() });

      await expect(
        service.convert({ code: 'ABC123', referredEmail: 'friend@test.com', ipAddress: '127.0.0.1' }),
      ).rejects.toThrow('Duplicate referral detected from this device');
    });

    it('should convert a valid referral', async () => {
      mockPrisma.referralLink.findUnique.mockResolvedValue(linkMock);
      mockPrisma.referral.findFirst.mockResolvedValue(null);
      mockPrisma.referral.create.mockResolvedValue({ id: 'ref-id' });
      mockPrisma.reward.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.referral.update.mockResolvedValue({ id: 'ref-id', status: 'rewarded' });
      mockPrisma.customer.findUnique.mockResolvedValue(null);
      mockPrisma.business.findUnique.mockResolvedValue(bizMock);
      mockPrisma.customer.count.mockResolvedValue(5);
      mockPrisma.customer.upsert.mockResolvedValue({ id: 'new-cust-id', email: 'friend@test.com' });
      mockPrisma.referralLink.create.mockResolvedValue({ id: 'new-link', code: 'NEWCODE' });
      mockPrisma.referral.findUnique.mockResolvedValue({ id: 'ref-id', referralLink: linkMock, rewards: [] });

      const result = await service.convert({
        code: 'ABC123',
        referredEmail: 'friend@test.com',
        ipAddress: '192.168.1.1',
      });

      expect(result).toBeDefined();
      expect(result.newReferralCode).toHaveLength(10);
      expect(mockPrisma.referral.create).toHaveBeenCalled();
      expect(mockPrisma.reward.createMany).toHaveBeenCalled();
    });
  });
});
