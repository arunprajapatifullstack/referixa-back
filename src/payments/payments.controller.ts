import { Controller, Post, Body, Headers, UseGuards, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BusinessId } from '../common/decorators/business.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  createOrder(@BusinessId() businessId: string, @Body() dto: CreateOrderDto) {
    return this.paymentsService.createOrder(businessId, dto.plan);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  verifyPayment(@Body() body: any, @Headers('x-razorpay-signature') signature: string) {
    return this.paymentsService.verifyPayment(body, signature);
  }

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(body, signature);
  }
}
