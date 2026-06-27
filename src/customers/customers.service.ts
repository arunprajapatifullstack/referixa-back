import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PLAN_LIMITS } from '../common/plan-limits';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string) {
    return this.prisma.customer.findMany({
      where: { businessId },
      include: { _count: { select: { referralLinks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(businessId: string, dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { businessId_email: { businessId, email: dto.email } },
    });
    if (existing) {
      throw new ConflictException('Customer with this email already exists');
    }

    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    const plan = business?.plan || 'free';
    const limit = PLAN_LIMITS[plan]?.customers || 50;
    const count = await this.prisma.customer.count({ where: { businessId } });
    if (count >= limit) {
      throw new BadRequestException(
        `You've reached the ${plan === 'free' ? '50-customer' : `${limit}-customer`} limit on your ${plan} plan. Upgrade to add more customers.`,
      );
    }

    return this.prisma.customer.create({
      data: {
        businessId,
        email: dto.email,
        name: dto.name,
      },
    });
  }
}
