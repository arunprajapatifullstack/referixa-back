import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    createOrder(businessId: string, dto: CreateOrderDto): Promise<{
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
    handleWebhook(body: any, signature: string): Promise<{
        received: boolean;
    }>;
}
