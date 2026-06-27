"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plan_limits_1 = require("../common/plan-limits");
let CampaignsService = class CampaignsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(businessId) {
        return this.prisma.campaign.findMany({
            where: { businessId },
            include: { _count: { select: { referralLinks: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(businessId, id) {
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
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return campaign;
    }
    async create(businessId, dto) {
        const business = await this.prisma.business.findUnique({ where: { id: businessId } });
        const plan = business?.plan || 'free';
        const limit = plan_limits_1.PLAN_LIMITS[plan]?.campaigns || 1;
        const count = await this.prisma.campaign.count({ where: { businessId } });
        if (count >= limit) {
            throw new common_1.BadRequestException(`You've reached the ${plan === 'free' ? '1-campaign' : `${limit}-campaign`} limit on your ${plan} plan. Upgrade to create more campaigns.`);
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
    async update(businessId, id, dto) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id, businessId },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return this.prisma.campaign.update({
            where: { id },
            data: dto,
        });
    }
    async remove(businessId, id) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id, businessId },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        await this.prisma.campaign.delete({ where: { id } });
        return { message: 'Campaign deleted' };
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map