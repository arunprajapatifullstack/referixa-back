import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateReferralLinkDto } from './dto/create-referral-link.dto';
export declare class ReferralLinksService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    create(businessId: string, dto: CreateReferralLinkDto): Promise<{
        campaign: {
            name: string;
            id: string;
            createdAt: Date;
            status: string;
            referrerRewardType: string;
            referrerRewardValue: import("@prisma/client/runtime/library").Decimal;
            referredRewardType: string;
            referredRewardValue: import("@prisma/client/runtime/library").Decimal;
            businessId: string;
        };
        customer: {
            name: string | null;
            email: string;
            id: string;
            createdAt: Date;
            businessId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        customerId: string;
        code: string;
        clicks: number;
    }>;
    trackClick(code: string): Promise<{
        campaign: {
            name: string;
            id: string;
            createdAt: Date;
            status: string;
            referrerRewardType: string;
            referrerRewardValue: import("@prisma/client/runtime/library").Decimal;
            referredRewardType: string;
            referredRewardValue: import("@prisma/client/runtime/library").Decimal;
            businessId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        customerId: string;
        code: string;
        clicks: number;
    }>;
    lookupCode(code: string): Promise<{
        campaign: {
            business: {
                name: string;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            status: string;
            referrerRewardType: string;
            referrerRewardValue: import("@prisma/client/runtime/library").Decimal;
            referredRewardType: string;
            referredRewardValue: import("@prisma/client/runtime/library").Decimal;
            businessId: string;
        };
        customer: {
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        customerId: string;
        code: string;
        clicks: number;
    }>;
    getCustomerPortal(code: string): Promise<{
        link: {
            code: string;
            clicks: number;
            createdAt: Date;
        };
        campaign: {
            name: string;
            status: string;
        };
        customer: {
            name: string | null;
            email: string;
        };
        totalReferrals: number;
        referrals: ({
            rewards: {
                id: string;
                status: string;
                code: string;
                referralId: string;
                recipientType: string;
                rewardType: string;
                rewardValue: import("@prisma/client/runtime/library").Decimal;
                issuedAt: Date;
                redeemedAt: Date | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            status: string;
            referralLinkId: string;
            referredEmail: string;
            convertedAt: Date | null;
            ipAddress: string | null;
        })[];
        rewards: ({
            referral: {
                referralLink: {
                    code: string;
                };
            } & {
                id: string;
                createdAt: Date;
                status: string;
                referralLinkId: string;
                referredEmail: string;
                convertedAt: Date | null;
                ipAddress: string | null;
            };
        } & {
            id: string;
            status: string;
            code: string;
            referralId: string;
            recipientType: string;
            rewardType: string;
            rewardValue: import("@prisma/client/runtime/library").Decimal;
            issuedAt: Date;
            redeemedAt: Date | null;
        })[];
    }>;
    findByCampaign(businessId: string, campaignId: string): Promise<({
        customer: {
            name: string | null;
            email: string;
            id: string;
            createdAt: Date;
            businessId: string;
        };
        _count: {
            referrals: number;
        };
    } & {
        id: string;
        createdAt: Date;
        campaignId: string;
        customerId: string;
        code: string;
        clicks: number;
    })[]>;
}
