import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(businessId: string): Promise<{
        totalReferrals: number;
        convertedReferrals: number;
        conversionRate: number;
        totalRewards: number;
        redeemedRewards: number;
        totalClicks: number;
        totalCampaigns: number;
        topReferrers: {
            name: string;
            email: string;
            referralsCount: number;
            clicks: number;
        }[];
        referralsOverTime: {
            date: string;
            status: string;
        }[];
    }>;
}
