import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateReferralLinkDto } from './dto/create-referral-link.dto';

@Injectable()
export class ReferralLinksService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(businessId: string, dto: CreateReferralLinkDto) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: dto.campaignId, businessId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, businessId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const code = uuidv4().replace(/-/g, '').substring(0, 10);

    const link = await this.prisma.referralLink.create({
      data: {
        campaignId: dto.campaignId,
        customerId: dto.customerId,
        code,
      },
      include: {
        campaign: true,
        customer: true,
      },
    });

    this.mailService.sendReferralLink(
      customer.email,
      customer.name || customer.email,
      campaign.name,
      code,
    ).catch(() => {});

    return link;
  }

  async trackClick(code: string) {
    const link = await this.prisma.referralLink.findUnique({
      where: { code },
      include: { campaign: true },
    });
    if (!link) throw new NotFoundException('Invalid referral link');

    await this.prisma.referralLink.update({
      where: { code },
      data: { clicks: { increment: 1 } },
    });

    return link;
  }

  async lookupCode(code: string) {
    const link = await this.prisma.referralLink.findUnique({
      where: { code },
      include: {
        campaign: {
          include: { business: { select: { name: true } } },
        },
        customer: { select: { name: true } },
      },
    });
    if (!link) throw new NotFoundException('Invalid referral code');
    return link;
  }

  async getCustomerPortal(code: string) {
    const link = await this.prisma.referralLink.findUnique({
      where: { code },
      include: {
        campaign: { select: { name: true, status: true } },
        customer: { select: { name: true, email: true } },
        _count: { select: { referrals: true } },
      },
    });
    if (!link) throw new NotFoundException('Invalid referral code');

    const referrals = await this.prisma.referral.findMany({
      where: { referralLinkId: link.id },
      include: { rewards: true },
      orderBy: { createdAt: 'desc' },
    });

    const rewards = await this.prisma.reward.findMany({
      where: {
        referral: {
          referralLink: { customerId: link.customerId },
          status: 'rewarded',
        },
        recipientType: 'referrer',
      },
      include: {
        referral: {
          include: {
            referralLink: { select: { code: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return {
      link: { code: link.code, clicks: link.clicks, createdAt: link.createdAt },
      campaign: link.campaign,
      customer: link.customer,
      totalReferrals: link._count.referrals,
      referrals,
      rewards,
    };
  }

  async findByCampaign(businessId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, businessId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.referralLink.findMany({
      where: { campaignId },
      include: { customer: true, _count: { select: { referrals: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
