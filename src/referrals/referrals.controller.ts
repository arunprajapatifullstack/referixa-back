import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { ReferralsService } from './referrals.service';
import { ConvertReferralDto } from './dto/convert-referral.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BusinessId } from '../common/decorators/business.decorator';

@ApiTags('Referrals')
@Controller('referrals')
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all referrals for a business' })
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @BusinessId() businessId: string,
    @Query('campaignId') campaignId?: string,
    @Query('status') status?: string,
  ) {
    return this.referralsService.findAll(businessId, campaignId, status);
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert a referral (public, no auth)' })
  convert(@Body() dto: ConvertReferralDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.referralsService.convert({ ...dto, ipAddress: ip });
  }
}
