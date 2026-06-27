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
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RewardsService = class RewardsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(businessId, status) {
        const where = {
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
    async verifyPair(businessId, code1, code2) {
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
        if (!reward1)
            throw new common_1.NotFoundException(`Code ${code1} not found`);
        if (!reward2)
            throw new common_1.NotFoundException(`Code ${code2} not found`);
        if (reward1.referralId !== reward2.referralId) {
            throw new common_1.BadRequestException('These codes do not belong to the same referral');
        }
        return { reward1, reward2 };
    }
    async redeemByCode(businessId, code) {
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
        if (!reward)
            throw new common_1.NotFoundException('Invalid reward code');
        if (reward.status === 'redeemed') {
            throw new common_1.BadRequestException('Reward already redeemed on ' + reward.redeemedAt?.toISOString().split('T')[0]);
        }
        if (reward.status === 'expired') {
            throw new common_1.BadRequestException('Reward has expired');
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
    async redeem(businessId, id) {
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
        if (!reward)
            throw new common_1.NotFoundException('Reward not found');
        if (reward.status === 'redeemed') {
            throw new common_1.BadRequestException('Reward already redeemed');
        }
        if (reward.status === 'expired') {
            throw new common_1.BadRequestException('Reward has expired');
        }
        return this.prisma.reward.update({
            where: { id },
            data: {
                status: 'redeemed',
                redeemedAt: new Date(),
            },
        });
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map