import { Request } from 'express';
import { ReferralsService } from './referrals.service';
import { ConvertReferralDto } from './dto/convert-referral.dto';
export declare class ReferralsController {
    private referralsService;
    constructor(referralsService: ReferralsService);
    findAll(businessId: string, campaignId?: string, status?: string): Promise<({
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
    })[]>;
    convert(dto: ConvertReferralDto, req: Request): Promise<{
        newReferralCode: string;
        referralLink?: ({
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
        }) | undefined;
        rewards?: {
            id: string;
            status: string;
            code: string;
            referralId: string;
            recipientType: string;
            rewardType: string;
            rewardValue: import("@prisma/client/runtime/library").Decimal;
            issuedAt: Date;
            redeemedAt: Date | null;
        }[] | undefined;
        id?: string | undefined;
        createdAt?: Date | undefined;
        status?: string | undefined;
        referralLinkId?: string | undefined;
        referredEmail?: string | undefined;
        convertedAt?: Date | null | undefined;
        ipAddress?: string | null | undefined;
    }>;
}
