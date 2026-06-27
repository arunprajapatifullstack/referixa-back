import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto';
export declare class CampaignsController {
    private campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(businessId: string): Promise<({
        _count: {
            referralLinks: number;
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
    })[]>;
    findOne(businessId: string, id: string): Promise<{
        referralLinks: ({
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
        })[];
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
    }>;
    create(businessId: string, dto: CreateCampaignDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        status: string;
        referrerRewardType: string;
        referrerRewardValue: import("@prisma/client/runtime/library").Decimal;
        referredRewardType: string;
        referredRewardValue: import("@prisma/client/runtime/library").Decimal;
        businessId: string;
    }>;
    update(businessId: string, id: string, dto: UpdateCampaignDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        status: string;
        referrerRewardType: string;
        referrerRewardValue: import("@prisma/client/runtime/library").Decimal;
        referredRewardType: string;
        referredRewardValue: import("@prisma/client/runtime/library").Decimal;
        businessId: string;
    }>;
    remove(businessId: string, id: string): Promise<{
        message: string;
    }>;
}
