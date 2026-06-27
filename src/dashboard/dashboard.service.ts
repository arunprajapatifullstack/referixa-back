import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(businessId: string) {
    const totalReferrals = await this.prisma.referral.count({
      where: {
        referralLink: {
          campaign: { businessId },
        },
      },
    });

    const convertedReferrals = await this.prisma.referral.count({
      where: {
        referralLink: {
          campaign: { businessId },
        },
        status: { in: ['converted', 'rewarded'] },
      },
    });

    const totalRewards = await this.prisma.reward.count({
      where: {
        referral: {
          referralLink: {
            campaign: { businessId },
          },
        },
      },
    });

    const redeemedRewards = await this.prisma.reward.count({
      where: {
        referral: {
          referralLink: {
            campaign: { businessId },
          },
        },
        status: 'redeemed',
      },
    });

    const totalClicks = await this.prisma.referralLink.aggregate({
      where: {
        campaign: { businessId },
      },
      _sum: { clicks: true },
    });

    const topReferrers = await this.prisma.referralLink.findMany({
      where: {
        campaign: { businessId },
      },
      include: {
        customer: true,
        _count: { select: { referrals: true } },
      },
      orderBy: {
        referrals: { _count: 'desc' },
      },
      take: 5,
    });

    const referralsOverTime = await this.prisma.referral.findMany({
      where: {
        referralLink: {
          campaign: { businessId },
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalCampaigns = await this.prisma.campaign.count({
      where: { businessId },
    });

    const conversionRate = totalReferrals > 0
      ? Math.round((convertedReferrals / totalReferrals) * 10000) / 100
      : 0;

    return {
      totalReferrals,
      convertedReferrals,
      conversionRate,
      totalRewards,
      redeemedRewards,
      totalClicks: totalClicks._sum.clicks || 0,
      totalCampaigns,
      topReferrers: topReferrers.map((r) => ({
        name: r.customer.name || r.customer.email,
        email: r.customer.email,
        referralsCount: r._count.referrals,
        clicks: r.clicks,
      })),
      referralsOverTime: referralsOverTime.map((r) => ({
        date: r.createdAt.toISOString().split('T')[0],
        status: r.status,
      })),
    };
  }
}
