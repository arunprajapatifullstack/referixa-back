import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
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
