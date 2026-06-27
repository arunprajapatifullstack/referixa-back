import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

const PLAN_PRICES: Record<string, { amount: number; description: string }> = {
  pro: { amount: 49900, description: 'ReferLoop Pro - Monthly' },
  enterprise: { amount: 299900, description: 'ReferLoop Enterprise - Monthly' },
};

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID') || '',
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET') || '',
    });
  }

  async createOrder(businessId: string, plan: string) {
    const planConfig = PLAN_PRICES[plan];
    if (!planConfig) {
      throw new BadRequestException('Invalid plan');
    }

    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      throw new BadRequestException('Business not found');
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
        key: this.configService.get<string>('RAZORPAY_KEY_ID'),
        business: {
          name: business.name,
          email: business.email,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to create Razorpay order');
    }
  }

  async verifyPayment(body: any, signature: string) {
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET') || '')
      .update(`${body.order_id}|${body.payment_id}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid payment signature');
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

  async handleWebhook(webhookBody: any, webhookSignature: string) {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(webhookBody))
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      throw new BadRequestException('Invalid webhook signature');
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
      } catch {
        // Log error but don't throw in webhook
      }
    }

    return { received: true };
  }
}
