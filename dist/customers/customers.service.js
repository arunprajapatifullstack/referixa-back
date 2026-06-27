"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plan_limits_1 = require("../common/plan-limits");
let CustomersService = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(businessId) {
        return this.prisma.customer.findMany({
            where: { businessId },
            include: { _count: { select: { referralLinks: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(businessId, dto) {
        const existing = await this.prisma.customer.findUnique({
            where: { businessId_email: { businessId, email: dto.email } },
        });
        if (existing) {
            throw new common_1.ConflictException('Customer with this email already exists');
        }
        const business = await this.prisma.business.findUnique({ where: { id: businessId } });
        const plan = business?.plan || 'free';
        const limit = plan_limits_1.PLAN_LIMITS[plan]?.customers || 50;
        const count = await this.prisma.customer.count({ where: { businessId } });
        if (count >= limit) {
            throw new common_1.BadRequestException(`You've reached the ${plan === 'free' ? '50-customer' : `${limit}-customer`} limit on your ${plan} plan. Upgrade to add more customers.`);
        }
        return this.prisma.customer.create({
            data: {
                businessId,
                email: dto.email,
                name: dto.name,
            },
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map