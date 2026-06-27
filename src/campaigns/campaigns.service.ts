import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto';
import { PLAN_LIMITS } from '../common/plan-limits';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string) {
    return this.prisma.campaign.findMany({
      where: { businessId },
      include: { _count: { select: { referralLinks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(businessId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, businessId },
      include: {
        referralLinks: {
          include: {
            customer: true,
            _count: { select: { referrals: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(businessId: string, dto: CreateCampaignDto) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    const plan = business?.plan || 'free';
    const limit = PLAN_LIMITS[plan]?.campaigns || 1;
    const count = await this.prisma.campaign.count({ where: { businessId } });
    if (count >= limit) {
      throw new BadRequestException(
        `You've reached the ${plan === 'free' ? '1-campaign' : `${limit}-campaign`} limit on your ${plan} plan. Upgrade to create more campaigns.`,
      );
    }

    return this.prisma.campaign.create({
      data: {
        businessId,
        name: dto.name,
        status: dto.status || 'active',
        referrerRewardType: dto.referrerRewardType,
        referrerRewardValue: dto.referrerRewardValue,
        referredRewardType: dto.referredRewardType,
        referredRewardValue: dto.referredRewardValue,
      },
    });
  }

  async update(businessId: string, id: string, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, businessId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.campaign.update({
      where: { id },
      data: dto,
    });
  }

  async remove(businessId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, businessId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    await this.prisma.campaign.delete({ where: { id } });
    return { message: 'Campaign deleted' };
  }
}
