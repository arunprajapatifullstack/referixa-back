import { RewardsService } from './rewards.service';
export declare class RewardsController {
    private rewardsService;
    constructor(rewardsService: RewardsService);
    findAll(businessId: string, status?: string): Promise<({
        referral: {
            referralLink: {
                campaign: {
                    name: string;
                };
                customer: {
                    name: string | null;
                    email: string;
                };
            } & {
                id: string;
                createdAt: Date;
                campaignId: string;
                customerId: string;
                code: string;
                clicks: number;
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
    })[]>;
    verifyPair(businessId: string, code1: string, code2: string): Promise<{
        reward1: {
            referral: {
                referralLink: {
                    campaign: {
                        name: string;
                    };
                    customer: {
                        name: string | null;
                        email: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    campaignId: string;
                    customerId: string;
                    code: string;
                    clicks: number;
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
        };
        reward2: {
            referral: {
                referralLink: {
                    campaign: {
                        name: string;
                    };
                    customer: {
                        name: string | null;
                        email: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    campaignId: string;
                    customerId: string;
                    code: string;
                    clicks: number;
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
        };
    }>;
    redeemByCode(businessId: string, code: string): Promise<{
        referral: {
            referralLink: {
                campaign: {
                    name: string;
                };
                customer: {
                    name: string | null;
                    email: string;
                };
            } & {
                id: string;
                createdAt: Date;
                campaignId: string;
                customerId: string;
                code: string;
                clicks: number;
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
    }>;
    redeem(businessId: string, id: string): Promise<{
        id: string;
        status: string;
        code: string;
        referralId: string;
        recipientType: string;
        rewardType: string;
        rewardValue: import("@prisma/client/runtime/library").Decimal;
        issuedAt: Date;
        redeemedAt: Date | null;
    }>;
}
