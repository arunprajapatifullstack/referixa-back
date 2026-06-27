export declare class CreateCampaignDto {
    name: string;
    status?: string;
    referrerRewardType: string;
    referrerRewardValue: number;
    referredRewardType: string;
    referredRewardValue: number;
}
export declare class UpdateCampaignDto {
    name?: string;
    status?: string;
    referrerRewardType?: string;
    referrerRewardValue?: number;
    referredRewardType?: string;
    referredRewardValue?: number;
}
