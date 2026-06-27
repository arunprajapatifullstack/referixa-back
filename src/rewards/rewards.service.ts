import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, status?: string) {
    const where: any = {
      referral: {
        referralLink: {
          campaign: { businessId },
        },
      },
    };
    if (status) {
      where.status = status;
    }

    return this.prisma.reward.findMany({
      where,
      include: {
        referral: {
          include: {
            referralLink: {
              include: {
                campaign: { select: { name: true } },
                customer: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verifyPair(businessId: string, code1: string, code2: string) {
    const reward1 = await this.prisma.reward.findFirst({
      where: {
        code: code1,
        referral: { referralLink: { campaign: { businessId } } },
      },
      include: {
        referral: {
          include: {
            referralLink: {
              include: {
                campaign: { select: { name: true } },
                customer: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });
    const reward2 = await this.prisma.reward.findFirst({
      where: {
        code: code2,
        referral: { referralLink: { campaign: { businessId } } },
      },
      include: {
        referral: {
          include: {
            referralLink: {
              include: {
                campaign: { select: { name: true } },
                customer: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!reward1) throw new NotFoundException(`Code ${code1} not found`);
    if (!reward2) throw new NotFoundException(`Code ${code2} not found`);
    if (reward1.referralId !== reward2.referralId) {
      throw new BadRequestException('These codes do not belong to the same referral');
    }

    return { reward1, reward2 };
  }

  async redeemByCode(businessId: string, code: string) {
    const reward = await this.prisma.reward.findFirst({
      where: {
        code,
        referral: {
          referralLink: {
            campaign: { businessId },
          },
        },
      },
      include: {
        referral: {
          include: {
            referralLink: {
              include: {
                campaign: { select: { name: true } },
                customer: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });
    if (!reward) throw new NotFoundException('Invalid reward code');
    if (reward.status === 'redeemed') {
      throw new BadRequestException('Reward already redeemed on ' + reward.redeemedAt?.toISOString().split('T')[0]);
    }
    if (reward.status === 'expired') {
      throw new BadRequestException('Reward has expired');
    }

    return this.prisma.reward.update({
      where: { id: reward.id },
      data: {
        status: 'redeemed',
        redeemedAt: new Date(),
      },
      include: {
        referral: {
          include: {
            referralLink: {
              include: {
                campaign: { select: { name: true } },
                customer: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });
  }

  async redeem(businessId: string, id: string) {
    const reward = await this.prisma.reward.findFirst({
      where: {
        id,
        referral: {
          referralLink: {
            campaign: { businessId },
          },
        },
      },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    if (reward.status === 'redeemed') {
      throw new BadRequestException('Reward already redeemed');
    }
    if (reward.status === 'expired') {
      throw new BadRequestException('Reward has expired');
    }

    return this.prisma.reward.update({
      where: { id },
      data: {
        status: 'redeemed',
        redeemedAt: new Date(),
      },
    });
  }
}
