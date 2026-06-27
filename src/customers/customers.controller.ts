import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BusinessId } from '../common/decorators/business.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  findAll(@BusinessId() businessId: string) {
    return this.customersService.findAll(businessId);
  }

  @Post()
  create(@BusinessId() businessId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(businessId, dto);
  }
}
