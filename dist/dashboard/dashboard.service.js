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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(businessId) {
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map