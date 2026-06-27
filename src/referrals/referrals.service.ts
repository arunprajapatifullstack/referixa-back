import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConvertReferralDto } from './dto/convert-referral.dto';
import { PLAN_LIMITS } from '../common/plan-limits';

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll(businessId: string, campaignId?: string, status?: string) {
    const where: any = {
      referralLink: {
        campaign: { businessId },
      },
    };
    if (campaignId) {
      where.referralLink.campaignId = campaignId;
    }
    if (status) {
      where.status = status;
    }

    return this.prisma.referral.findMany({
      where,
      include: {
        referralLink: {
          include: {
            campaign: { select: { name: true } },
            customer: { select: { name: true, email: true } },
          },
        },
        rewards: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async convert(dto: ConvertReferralDto) {
    const link = await this.prisma.referralLink.findUnique({
      where: { code: dto.code },
      include: { campaign: true, customer: true },
    });
    if (!link) {
      throw new NotFoundException('Invalid referral code');
    }

    if (link.campaign.status !== 'active') {
      throw new BadRequestException('Campaign is not active');
    }

    const existing = await this.prisma.referral.findFirst({
      where: {
        referralLinkId: link.id,
        referredEmail: dto.referredEmail,
      },
    });
    if (existing) {
      throw new BadRequestException('This email has already been referred');
    }

    if (dto.referredEmail.toLowerCase() === link.customer.email.toLowerCase()) {
      throw new BadRequestException('You cannot refer yourself');
    }

    if (dto.ipAddress) {
      const recentFraud = await this.prisma.referral.findFirst({
        where: {
          ipAddress: dto.ipAddress,
          referralLink: { campaignId: link.campaignId },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });
      if (recentFraud) {
        throw new BadRequestException('Duplicate referral detected from this device');
      }
    }

    const referral = await this.prisma.referral.create({
      data: {
        referralLinkId: link.id,
        referredEmail: dto.referredEmail,
        status: 'converted',
        convertedAt: new Date(),
        ipAddress: dto.ipAddress,
      },
    });

    const rewardCode1 = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    const rewardCode2 = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();

    await this.prisma.reward.createMany({
      data: [
        {
          referralId: referral.id,
          recipientType: 'referrer',
          rewardType: link.campaign.referrerRewardType,
          rewardValue: link.campaign.referrerRewardValue,
          code: rewardCode1,
        },
        {
          referralId: referral.id,
          recipientType: 'referred',
          rewardType: link.campaign.referredRewardType,
          rewardValue: link.campaign.referredRewardValue,
          code: rewardCode2,
        },
      ],
    });

    await this.prisma.referral.update({
      where: { id: referral.id },
      data: { status: 'rewarded' },
    });

    const existingCustomer = await this.prisma.customer.findUnique({
      where: { businessId_email: { businessId: link.campaign.businessId, email: dto.referredEmail } },
    });

    if (!existingCustomer) {
      const business = await this.prisma.business.findUnique({ where: { id: link.campaign.businessId } });
      const plan = business?.plan || 'free';
      const limit = PLAN_LIMITS[plan]?.customers || 50;
      const count = await this.prisma.customer.count({ where: { businessId: link.campaign.businessId } });
      if (count >= limit) {
        throw new BadRequestException(
          `Customer limit reached on your ${plan} plan. Upgrade to accept more referrals.`,
        );
      }
    }

    const newCustomer = await this.prisma.customer.upsert({
      where: { businessId_email: { businessId: link.campaign.businessId, email: dto.referredEmail } },
      create: { businessId: link.campaign.businessId, email: dto.referredEmail },
      update: {},
    });

    const newCode = uuidv4().replace(/-/g, '').substring(0, 10);
    const newLink = await this.prisma.referralLink.create({
      data: {
        campaignId: link.campaignId,
        customerId: newCustomer.id,
        code: newCode,
      },
    });

    const upstreamReferral = await this.prisma.referral.findFirst({
      where: {
        referredEmail: link.customer.email,
        referralLink: { campaignId: link.campaignId },
        status: 'rewarded',
      },
      include: {
        referralLink: { include: { customer: true } },
      },
    });

    if (upstreamReferral) {
      const multiCode = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
      const multiValue = Math.round(Number(link.campaign.referrerRewardValue) * 0.5);
      const multiType = link.campaign.referrerRewardType;

      await this.prisma.reward.create({
        data: {
          referralId: referral.id,
          recipientType: 'referrer',
          rewardType: multiType,
          rewardValue: multiValue,
          code: multiCode,
        },
      });
    }

    const rewardLabel = (type: string, value: any) => {
      if (type === 'percentage') return `${value}% OFF`;
      if (type === 'fixed') return `₹${value} OFF`;
      return `${value} ${type}`;
    };

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    this.mailService.sendConversionRewards(
      dto.referredEmail,
      dto.referredEmail,
      link.customer.name || link.customer.email,
      link.campaign.name,
      rewardCode2,
      rewardLabel(link.campaign.referredRewardType, link.campaign.referredRewardValue),
      newCode,
      frontendUrl,
    ).catch(() => {});

    this.mailService.sendReferrerRewardNotification(
      link.customer.email,
      link.customer.name || link.customer.email,
      dto.referredEmail,
      link.campaign.name,
      rewardCode1,
      rewardLabel(link.campaign.referrerRewardType, link.campaign.referrerRewardValue),
    ).catch(() => {});

    const result = await this.prisma.referral.findUnique({
      where: { id: referral.id },
      include: {
        referralLink: {
          include: {
            campaign: { select: { name: true } },
            customer: { select: { name: true, email: true } },
          },
        },
        rewards: true,
      },
    });

    return { ...result, newReferralCode: newCode };
  }
}
