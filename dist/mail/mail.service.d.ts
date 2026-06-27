import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private config;
    private sgMail;
    private from;
    constructor(config: ConfigService);
    private layout;
    private header;
    private body;
    sendReferralLink(email: string, customerName: string, campaignName: string, code: string): Promise<void>;
    sendConversionRewards(referredEmail: string, referredName: string, referrerName: string, campaignName: string, referredCode: string, referredReward: string, newReferralCode: string, frontendUrl: string): Promise<void>;
    sendReferrerRewardNotification(referrerEmail: string, referrerName: string, referredName: string, campaignName: string, referrerCode: string, referrerReward: string): Promise<void>;
}
