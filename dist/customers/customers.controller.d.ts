import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomersController {
    private customersService;
    constructor(customersService: CustomersService);
    findAll(businessId: string): Promise<({
        _count: {
            referralLinks: number;
        };
    } & {
        name: string | null;
        email: string;
        id: string;
        createdAt: Date;
        businessId: string;
    })[]>;
    create(businessId: string, dto: CreateCustomerDto): Promise<{
        name: string | null;
        email: string;
        id: string;
        createdAt: Date;
        businessId: string;
    }>;
}
