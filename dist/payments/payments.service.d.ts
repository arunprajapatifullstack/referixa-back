import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    private configService;
    private razorpay;
    constructor(prisma: PrismaService, configService: ConfigService);
    createOrder(businessId: string, plan: string): Promise<{
        id: any;
        amount: any;
        currency: any;
        key: string | undefined;
        business: {
            name: string;
            email: string;
        };
    }>;
    verifyPayment(body: any, signature: string): Promise<{
        message: string;
        plan: any;
    }>;
    handleWebhook(webhookBody: any, webhookSignature: string): Promise<{
        received: boolean;
    }>;
}
