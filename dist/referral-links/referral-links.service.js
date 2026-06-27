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
exports.ReferralLinksService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let ReferralLinksService = class ReferralLinksService {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async create(businessId, dto) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: dto.campaignId, businessId },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        const customer = await this.prisma.customer.findFirst({
            where: { id: dto.customerId, businessId },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const code = (0, uuid_1.v4)().replace(/-/g, '').substring(0, 10);
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
        this.mailService.sendReferralLink(customer.email, customer.name || customer.email, campaign.name, code).catch(() => { });
        return link;
    }
    async trackClick(code) {
        const link = await this.prisma.referralLink.findUnique({
            where: { code },
            include: { campaign: true },
        });
        if (!link)
            throw new common_1.NotFoundException('Invalid referral link');
        await this.prisma.referralLink.update({
            where: { code },
            data: { clicks: { increment: 1 } },
        });
        return link;
    }
    async lookupCode(code) {
        const link = await this.prisma.referralLink.findUnique({
            where: { code },
            include: {
                campaign: {
                    include: { business: { select: { name: true } } },
                },
                customer: { select: { name: true } },
            },
        });
        if (!link)
            throw new common_1.NotFoundException('Invalid referral code');
        return link;
    }
    async getCustomerPortal(code) {
        const link = await this.prisma.referralLink.findUnique({
            where: { code },
            include: {
                campaign: { select: { name: true, status: true } },
                customer: { select: { name: true, email: true } },
                _count: { select: { referrals: true } },
            },
        });
        if (!link)
            throw new common_1.NotFoundException('Invalid referral code');
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
    async findByCampaign(businessId, campaignId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, businessId },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return this.prisma.referralLink.findMany({
            where: { campaignId },
            include: { customer: true, _count: { select: { referrals: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ReferralLinksService = ReferralLinksService;
exports.ReferralLinksService = ReferralLinksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], ReferralLinksService);
//# sourceMappingURL=referral-links.service.js.map