"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const PLAN_PRICES = {
    pro: { amount: 49900, description: 'ReferLoop Pro - Monthly' },
    enterprise: { amount: 299900, description: 'ReferLoop Enterprise - Monthly' },
};
let PaymentsService = class PaymentsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.razorpay = new razorpay_1.default({
            key_id: this.configService.get('RAZORPAY_KEY_ID') || '',
            key_secret: this.configService.get('RAZORPAY_KEY_SECRET') || '',
        });
    }
    async createOrder(businessId, plan) {
        const planConfig = PLAN_PRICES[plan];
        if (!planConfig) {
            throw new common_1.BadRequestException('Invalid plan');
        }
        const business = await this.prisma.business.findUnique({ where: { id: businessId } });
        if (!business) {
            throw new common_1.BadRequestException('Business not found');
        }
        const receipt = `ref_${businessId.slice(0, 8)}_${Date.now()}`;
        try {
            const order = await this.razorpay.orders.create({
                amount: planConfig.amount,
                currency: 'INR',
                receipt,
                notes: {
                    businessId,
                    plan,
                },
            });
            return {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                key: this.configService.get('RAZORPAY_KEY_ID'),
                business: {
                    name: business.name,
                    email: business.email,
                },
            };
        }
        catch (err) {
            throw new common_1.InternalServerErrorException('Failed to create Razorpay order');
        }
    }
    async verifyPayment(body, signature) {
        const expectedSignature = crypto
            .createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET') || '')
            .update(`${body.order_id}|${body.payment_id}`)
            .digest('hex');
        if (expectedSignature !== signature) {
            throw new common_1.BadRequestException('Invalid payment signature');
        }
        const order = await this.razorpay.orders.fetch(body.order_id);
        const plan = order.notes?.plan || 'pro';
        const businessId = order.notes?.businessId;
        if (businessId) {
            await this.prisma.business.update({
                where: { id: businessId },
                data: {
                    plan,
                    subscriptionStatus: 'active',
                    planUpdatedAt: new Date(),
                    razorpayCustomerId: body.razorpay_payment_id,
                },
            });
        }
        return { message: 'Payment verified successfully', plan };
    }
    async handleWebhook(webhookBody, webhookSignature) {
        const secret = this.configService.get('RAZORPAY_WEBHOOK_SECRET') || '';
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(webhookBody))
            .digest('hex');
        if (expectedSignature !== webhookSignature) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        const event = webhookBody.event;
        if (event === 'payment.captured' || event === 'payment.authorized') {
            const payment = webhookBody.payload.payment.entity;
            const orderId = payment.order_id;
            try {
                const order = await this.razorpay.orders.fetch(orderId);
                const businessId = order.notes?.businessId;
                const plan = order.notes?.plan || 'pro';
                if (businessId) {
                    await this.prisma.business.update({
                        where: { id: businessId },
                        data: {
                            plan,
                            subscriptionStatus: 'active',
                            planUpdatedAt: new Date(),
                            razorpayCustomerId: payment.id,
                        },
                    });
                }
            }
            catch {
            }
        }
        return { received: true };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map